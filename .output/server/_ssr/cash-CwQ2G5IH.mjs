import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { cn as _enum, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { a as nid, i as nextSessionNumber, n as iso, o as num, s as sql, t as fail } from "./helpers-DClzb-S1.mjs";
import { t as ensureShopSeeded } from "./seed-C5YASBEB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cash-CwQ2G5IH.js
function summarize(movements, opening) {
	const sales = movements.filter((m) => m.type === "SALE").reduce((s, m) => s + m.amount, 0);
	const refunds = movements.filter((m) => m.type === "REFUND").reduce((s, m) => s + m.amount, 0);
	const sangrias = movements.filter((m) => m.type === "SANGRIA").reduce((s, m) => s + m.amount, 0);
	const suprimentos = movements.filter((m) => m.type === "SUPRIMENTO").reduce((s, m) => s + m.amount, 0);
	const expenses = movements.filter((m) => m.type === "EXPENSE").reduce((s, m) => s + m.amount, 0);
	const salesByMethod = {};
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
		salesByMethod
	};
}
function mapMovement(r) {
	return {
		id: String(r.id),
		type: r.type,
		paymentMethod: r.payment_method ?? null,
		amount: num(r.amount),
		description: r.description ?? null,
		serviceOrderId: r.service_order_id ?? null,
		orderNumber: r.order_number == null ? null : num(r.order_number),
		createdBy: String(r.created_by),
		createdAt: iso(r.created_at) ?? ""
	};
}
async function loadRegister(db, userId, id) {
	const regs = await db.query(`select * from cash_registers where id = $1 and user_id = $2`, [id, userId]);
	if (!regs[0]) return null;
	return hydrate(db, userId, regs[0]);
}
async function hydrate(db, userId, r) {
	const movements = (await db.query(`select m.*, o.order_number
     from cash_movements m
     left join service_orders o on o.id = m.service_order_id
     where m.cash_register_id = $1 and m.user_id = $2
     order by m.created_at asc`, [r.id, userId])).map(mapMovement);
	const opening = num(r.opening_amount);
	return {
		id: String(r.id),
		sessionNumber: num(r.session_number),
		status: r.status,
		openedBy: String(r.opened_by),
		closedBy: r.closed_by ?? null,
		openedAt: iso(r.opened_at) ?? "",
		closedAt: iso(r.closed_at),
		openingAmount: opening,
		closingAmount: r.closing_amount == null ? null : num(r.closing_amount),
		expectedAmount: r.expected_amount == null ? null : num(r.expected_amount),
		difference: r.difference == null ? null : num(r.difference),
		notes: r.notes ?? null,
		movements,
		summary: summarize(movements, opening)
	};
}
var listCashRegisters_createServerFn_handler = createServerRpc({
	id: "66147989131a0e1b8c4f427abb3898cb6c23fa42b42bc822635315fd5d79874e",
	name: "listCashRegisters",
	filename: "src/lib/server/cash.ts"
}, (opts) => listCashRegisters.__executeServer(opts));
var listCashRegisters = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCashRegisters_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	const regs = await db.query(`select * from cash_registers where user_id = $1 order by session_number desc`, [context.userId]);
	const out = [];
	for (const r of regs) out.push(await hydrate(db, context.userId, r));
	return out;
});
var openCashRegister_createServerFn_handler = createServerRpc({
	id: "98a00dae93bc1cdb946ea9067d6415347876f0bab748872e09b12f357874818c",
	name: "openCashRegister",
	filename: "src/lib/server/cash.ts"
}, (opts) => openCashRegister.__executeServer(opts));
var openCashRegister = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	openingAmount: number(),
	notes: string().optional(),
	openedBy: string()
})).handler(openCashRegister_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	if (data.openingAmount < 0) fail("Valor de abertura inválido.");
	if ((await db.query(`select id from cash_registers where user_id = $1 and status = 'OPEN' limit 1`, [context.userId]))[0]) fail("Já existe um caixa aberto.");
	const id = nid();
	const session = await nextSessionNumber(db, context.userId);
	await db.query(`insert into cash_registers (id, user_id, session_number, status, opened_by, opening_amount, notes)
       values ($1,$2,$3,'OPEN',$4,$5,$6)`, [
		id,
		context.userId,
		session,
		data.openedBy.trim() || "Loja",
		data.openingAmount,
		data.notes || null
	]);
	await db.query(`insert into cash_movements (id, user_id, cash_register_id, type, amount, description, created_by)
       values ($1,$2,$3,'OPENING',$4,'Abertura de caixa',$5)`, [
		nid(),
		context.userId,
		id,
		data.openingAmount,
		data.openedBy.trim() || "Loja"
	]);
	return { id };
});
var closeCashRegister_createServerFn_handler = createServerRpc({
	id: "54cd9fbc8147816ad249e3941119f93fd34489412a6e245939a0ee86af30c05d",
	name: "closeCashRegister",
	filename: "src/lib/server/cash.ts"
}, (opts) => closeCashRegister.__executeServer(opts));
var closeCashRegister = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	closingAmount: number(),
	notes: string().optional(),
	closedBy: string()
})).handler(closeCashRegister_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const reg = await loadRegister(db, context.userId, data.id);
	if (!reg) fail("Caixa não encontrado.");
	if (reg.status === "CLOSED") fail("Caixa já está fechado.");
	const expected = reg.summary.expectedClosing;
	const difference = data.closingAmount - expected;
	await db.query(`update cash_registers set status='CLOSED', closed_at=now(), closed_by=$1, closing_amount=$2,
       expected_amount=$3, difference=$4, notes=coalesce($5, notes)
       where id=$6 and user_id=$7`, [
		data.closedBy.trim() || "Loja",
		data.closingAmount,
		expected,
		difference,
		data.notes || null,
		data.id,
		context.userId
	]);
	await db.query(`insert into cash_movements (id, user_id, cash_register_id, type, amount, description, created_by)
       values ($1,$2,$3,'CLOSING',$4,'Fechamento de caixa',$5)`, [
		nid(),
		context.userId,
		data.id,
		data.closingAmount,
		data.closedBy.trim() || "Loja"
	]);
	return {
		ok: true,
		expected,
		difference
	};
});
var addCashMovement_createServerFn_handler = createServerRpc({
	id: "859978a65b3e944dfb2386ce946512be57172142860a8b23413b2a85c0da43b9",
	name: "addCashMovement",
	filename: "src/lib/server/cash.ts"
}, (opts) => addCashMovement.__executeServer(opts));
var addCashMovement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cashRegisterId: string(),
	type: _enum([
		"SALE",
		"REFUND",
		"SANGRIA",
		"SUPRIMENTO",
		"EXPENSE"
	]),
	amount: number().positive(),
	description: string().optional(),
	paymentMethod: string().optional(),
	createdBy: string()
})).handler(addCashMovement_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const reg = await db.query(`select status from cash_registers where id = $1 and user_id = $2`, [data.cashRegisterId, context.userId]);
	if (!reg[0]) fail("Caixa não encontrado.");
	if (reg[0].status !== "OPEN") fail("Caixa fechado.");
	await db.query(`insert into cash_movements (id, user_id, cash_register_id, type, payment_method, amount, description, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`, [
		nid(),
		context.userId,
		data.cashRegisterId,
		data.type,
		data.paymentMethod || null,
		data.amount,
		data.description || null,
		data.createdBy.trim() || "Loja"
	]);
	return { ok: true };
});
//#endregion
export { addCashMovement_createServerFn_handler, closeCashRegister_createServerFn_handler, listCashRegisters_createServerFn_handler, openCashRegister_createServerFn_handler };
