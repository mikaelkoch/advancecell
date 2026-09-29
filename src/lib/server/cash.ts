import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import type { CashMovementType } from "@/lib/domain";
import type { CashMovement, CashRegister } from "@/lib/types";
import { fail, iso, nid, nextSessionNumber, num, sql } from "./helpers";
import { ensureShopSeeded } from "./seed";
import type { Sql } from "@/lib/db";

function summarize(movements: CashMovement[], opening: number) {
  const sales = movements.filter((m) => m.type === "SALE").reduce((s, m) => s + m.amount, 0);
  const refunds = movements.filter((m) => m.type === "REFUND").reduce((s, m) => s + m.amount, 0);
  const sangrias = movements.filter((m) => m.type === "SANGRIA").reduce((s, m) => s + m.amount, 0);
  const suprimentos = movements.filter((m) => m.type === "SUPRIMENTO").reduce((s, m) => s + m.amount, 0);
  const expenses = movements.filter((m) => m.type === "EXPENSE").reduce((s, m) => s + m.amount, 0);
  const salesByMethod: Record<string, number> = {};
  for (const m of movements.filter((x) => x.type === "SALE" || x.type === "REFUND")) {
    const key = m.paymentMethod || "Não informado";
    salesByMethod[key] = (salesByMethod[key] || 0) + m.amount;
  }
  return {
    sales,
    refunds,
    sangrias,
    suprimentos,
    expenses,
    expectedClosing: opening + sales - refunds + suprimentos - sangrias - expenses,
    salesByMethod,
  };
}

function mapMovement(r: Record<string, unknown>): CashMovement {
  return {
    id: String(r.id),
    type: r.type as CashMovementType,
    paymentMethod: (r.payment_method as string | null) ?? null,
    amount: num(r.amount),
    description: (r.description as string | null) ?? null,
    serviceOrderId: (r.service_order_id as string | null) ?? null,
    orderNumber: r.order_number == null ? null : num(r.order_number),
    createdBy: String(r.created_by),
    createdAt: iso(r.created_at) ?? "",
  };
}

async function loadRegister(db: Sql, userId: string, id: string): Promise<CashRegister | null> {
  const regs = await db.query<Record<string, unknown>>(
    `select * from cash_registers where id = $1 and user_id = $2`,
    [id, userId],
  );
  if (!regs[0]) return null;
  return hydrate(db, userId, regs[0]);
}

async function hydrate(db: Sql, userId: string, r: Record<string, unknown>): Promise<CashRegister> {
  const moves = await db.query<Record<string, unknown>>(
    `select m.*, o.order_number
     from cash_movements m
     left join service_orders o on o.id = m.service_order_id
     where m.cash_register_id = $1 and m.user_id = $2
     order by m.created_at asc`,
    [r.id, userId],
  );
  const movements = moves.map(mapMovement);
  const opening = num(r.opening_amount);
  return {
    id: String(r.id),
    sessionNumber: num(r.session_number),
    status: r.status as "OPEN" | "CLOSED",
    openedBy: String(r.opened_by),
    closedBy: (r.closed_by as string | null) ?? null,
    openedAt: iso(r.opened_at) ?? "",
    closedAt: iso(r.closed_at),
    openingAmount: opening,
    closingAmount: r.closing_amount == null ? null : num(r.closing_amount),
    expectedAmount: r.expected_amount == null ? null : num(r.expected_amount),
    difference: r.difference == null ? null : num(r.difference),
    notes: (r.notes as string | null) ?? null,
    movements,
    summary: summarize(movements, opening),
  };
}

export const listCashRegisters = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CashRegister[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const regs = await db.query<Record<string, unknown>>(
      `select * from cash_registers where user_id = $1 order by session_number desc`,
      [context.userId],
    );
    const out: CashRegister[] = [];
    for (const r of regs) out.push(await hydrate(db, context.userId, r));
    return out;
  });

export const openCashRegister = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ openingAmount: z.number(), notes: z.string().optional(), openedBy: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    if (data.openingAmount < 0) fail("Valor de abertura inválido.");
    const open = await db.query(
      `select id from cash_registers where user_id = $1 and status = 'OPEN' limit 1`,
      [context.userId],
    );
    if (open[0]) fail("Já existe um caixa aberto.");
    const id = nid();
    const session = await nextSessionNumber(db, context.userId);
    await db.query(
      `insert into cash_registers (id, user_id, session_number, status, opened_by, opening_amount, notes)
       values ($1,$2,$3,'OPEN',$4,$5,$6)`,
      [id, context.userId, session, data.openedBy.trim() || "Loja", data.openingAmount, data.notes || null],
    );
    await db.query(
      `insert into cash_movements (id, user_id, cash_register_id, type, amount, description, created_by)
       values ($1,$2,$3,'OPENING',$4,'Abertura de caixa',$5)`,
      [nid(), context.userId, id, data.openingAmount, data.openedBy.trim() || "Loja"],
    );
    return { id };
  });

export const closeCashRegister = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), closingAmount: z.number(), notes: z.string().optional(), closedBy: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const reg = await loadRegister(db, context.userId, data.id);
    if (!reg) fail("Caixa não encontrado.");
    if (reg.status === "CLOSED") fail("Caixa já está fechado.");
    const expected = reg.summary.expectedClosing;
    const difference = data.closingAmount - expected;
    await db.query(
      `update cash_registers set status='CLOSED', closed_at=now(), closed_by=$1, closing_amount=$2,
       expected_amount=$3, difference=$4, notes=coalesce($5, notes)
       where id=$6 and user_id=$7`,
      [
        data.closedBy.trim() || "Loja",
        data.closingAmount,
        expected,
        difference,
        data.notes || null,
        data.id,
        context.userId,
      ],
    );
    await db.query(
      `insert into cash_movements (id, user_id, cash_register_id, type, amount, description, created_by)
       values ($1,$2,$3,'CLOSING',$4,'Fechamento de caixa',$5)`,
      [nid(), context.userId, data.id, data.closingAmount, data.closedBy.trim() || "Loja"],
    );
    return { ok: true, expected, difference };
  });

export const addCashMovement = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cashRegisterId: z.string(),
      type: z.enum(["SALE", "REFUND", "SANGRIA", "SUPRIMENTO", "EXPENSE"]),
      amount: z.number().positive(),
      description: z.string().optional(),
      paymentMethod: z.string().optional(),
      createdBy: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    const reg = await db.query<{ status: string }>(
      `select status from cash_registers where id = $1 and user_id = $2`,
      [data.cashRegisterId, context.userId],
    );
    if (!reg[0]) fail("Caixa não encontrado.");
    if (reg[0].status !== "OPEN") fail("Caixa fechado.");
    await db.query(
      `insert into cash_movements (id, user_id, cash_register_id, type, payment_method, amount, description, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        nid(),
        context.userId,
        data.cashRegisterId,
        data.type,
        data.paymentMethod || null,
        data.amount,
        data.description || null,
        data.createdBy.trim() || "Loja",
      ],
    );
    return { ok: true };
  });
