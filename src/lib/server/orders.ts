import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { STATUS_FLOW, STATUS_LABELS, type ServiceOrderStatus } from "@/lib/domain";
import type { OrderItem, OrderService, ServiceOrder } from "@/lib/types";
import { fail, iso, nid, nextOrderNumber, num, sql } from "./helpers";
import { ensureShopSeeded } from "./seed";
import { notifyOrder } from "./whatsapp";
import type { Sql } from "@/lib/db";

const lineSchema = z.object({
  productId: z.string().optional(),
  serviceTypeId: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  notes: z.string().optional().nullable(),
});

const orderInput = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  deviceBrand: z.string().min(1),
  deviceModel: z.string().min(1),
  deviceSerial: z.string().optional().nullable(),
  deviceImei: z.string().optional().nullable(),
  defectDesc: z.string().min(1),
  accessories: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  technician: z.string().optional().nullable(),
  warrantyDays: z.number().int(),
  discount: z.number(),
  paidAmount: z.number(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  estimatedDate: z.string().optional().nullable(),
  items: z.array(lineSchema),
  services: z.array(lineSchema),
});

async function mapOrder(db: Sql, userId: string, row: Record<string, unknown>): Promise<ServiceOrder> {
  const items = await db.query<Record<string, unknown>>(
    `select i.*, p.name as product_name from service_order_items i
     join products p on p.id = i.product_id
     where i.service_order_id = $1 and i.user_id = $2`,
    [row.id, userId],
  );
  const services = await db.query<Record<string, unknown>>(
    `select s.*, t.name as service_name from service_order_services s
     join service_types t on t.id = s.service_type_id
     where s.service_order_id = $1 and s.user_id = $2`,
    [row.id, userId],
  );
  return {
    id: String(row.id),
    orderNumber: num(row.order_number),
    status: row.status as ServiceOrderStatus,
    clientId: String(row.client_id),
    clientName: String(row.client_name),
    clientPhone: String(row.client_phone),
    clientWhatsapp: (row.client_whatsapp as string | null) ?? null,
    deviceBrand: String(row.device_brand),
    deviceModel: String(row.device_model),
    deviceSerial: (row.device_serial as string | null) ?? null,
    deviceImei: (row.device_imei as string | null) ?? null,
    defectDesc: String(row.defect_desc),
    accessories: (row.accessories as string | null) ?? null,
    diagnosis: (row.diagnosis as string | null) ?? null,
    solution: (row.solution as string | null) ?? null,
    technician: (row.technician as string | null) ?? null,
    warrantyDays: num(row.warranty_days),
    laborPrice: num(row.labor_price),
    partsPrice: num(row.parts_price),
    discount: num(row.discount),
    totalPrice: num(row.total_price),
    paidAmount: num(row.paid_amount),
    paymentMethod: (row.payment_method as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    estimatedDate: iso(row.estimated_date),
    startedAt: iso(row.started_at),
    finishedAt: iso(row.finished_at),
    deliveredAt: iso(row.delivered_at),
    createdAt: iso(row.created_at) ?? "",
    updatedAt: iso(row.updated_at) ?? "",
    items: items.map(
      (i): OrderItem => ({
        id: String(i.id),
        productId: String(i.product_id),
        productName: String(i.product_name),
        quantity: num(i.quantity),
        unitPrice: num(i.unit_price),
        totalPrice: num(i.total_price),
      }),
    ),
    services: services.map(
      (s): OrderService => ({
        id: String(s.id),
        serviceTypeId: String(s.service_type_id),
        serviceName: String(s.service_name),
        quantity: num(s.quantity),
        unitPrice: num(s.unit_price),
        totalPrice: num(s.total_price),
        notes: (s.notes as string | null) ?? null,
      }),
    ),
  };
}

async function loadOrder(db: Sql, userId: string, id: string): Promise<ServiceOrder> {
  const rows = await db.query<Record<string, unknown>>(
    `select o.*, c.name as client_name, c.phone as client_phone, c.whatsapp as client_whatsapp
     from service_orders o join clients c on c.id = o.client_id
     where o.id = $1 and o.user_id = $2`,
    [id, userId],
  );
  if (!rows[0]) fail("Ordem não encontrada.");
  return mapOrder(db, userId, rows[0]);
}

async function replaceLines(
  db: Sql,
  userId: string,
  orderId: string,
  items: z.infer<typeof lineSchema>[],
  services: z.infer<typeof lineSchema>[],
  restoreStock: boolean,
) {
  if (restoreStock) {
    const old = await db.query<{ product_id: string; quantity: number }>(
      `select product_id, quantity from service_order_items where service_order_id = $1 and user_id = $2`,
      [orderId, userId],
    );
    for (const row of old) {
      await db.query(`update products set stock = stock + $1 where id = $2 and user_id = $3`, [
        row.quantity,
        row.product_id,
        userId,
      ]);
    }
  }
  await db.query(`delete from service_order_items where service_order_id = $1 and user_id = $2`, [orderId, userId]);
  await db.query(`delete from service_order_services where service_order_id = $1 and user_id = $2`, [orderId, userId]);

  let parts = 0;
  for (const item of items) {
    if (!item.productId) continue;
    const total = item.quantity * item.unitPrice;
    parts += total;
    await db.query(
      `insert into service_order_items (id, user_id, service_order_id, product_id, quantity, unit_price, total_price)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [nid(), userId, orderId, item.productId, item.quantity, item.unitPrice, total],
    );
    await db.query(`update products set stock = stock - $1 where id = $2 and user_id = $3`, [
      item.quantity,
      item.productId,
      userId,
    ]);
  }
  let labor = 0;
  for (const svc of services) {
    if (!svc.serviceTypeId) continue;
    const total = svc.quantity * svc.unitPrice;
    labor += total;
    await db.query(
      `insert into service_order_services (id, user_id, service_order_id, service_type_id, quantity, unit_price, total_price, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [nid(), userId, orderId, svc.serviceTypeId, svc.quantity, svc.unitPrice, total, svc.notes || null],
    );
  }
  return { parts, labor };
}

async function recordSaleIfNeeded(
  db: Sql,
  userId: string,
  order: { id: string; orderNumber: number; clientName: string },
  amount: number,
  method: string | null,
  createdBy: string,
) {
  if (amount <= 0) return;
  const open = await db.query<{ id: string }>(
    `select id from cash_registers where user_id = $1 and status = 'OPEN' limit 1`,
    [userId],
  );
  if (!open[0]) return;
  await db.query(
    `insert into cash_movements (id, user_id, cash_register_id, type, payment_method, amount, description, service_order_id, created_by)
     values ($1,$2,$3,'SALE',$4,$5,$6,$7,$8)`,
    [
      nid(),
      userId,
      open[0].id,
      method,
      amount,
      `OS #${order.orderNumber} — ${order.clientName}`,
      order.id,
      createdBy,
    ],
  );
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ServiceOrder[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const rows = await db.query<Record<string, unknown>>(
      `select o.*, c.name as client_name, c.phone as client_phone, c.whatsapp as client_whatsapp
       from service_orders o join clients c on c.id = o.client_id
       where o.user_id = $1 order by o.order_number desc`,
      [context.userId],
    );
    const out: ServiceOrder[] = [];
    for (const row of rows) out.push(await mapOrder(db, context.userId, row));
    return out;
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    return loadOrder(db, context.userId, data.id);
  });

export const saveOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(orderInput)
  .handler(async ({ context, data }) => {
    const db = await sql();
    const client = await db.query<{ name: string }>(
      `select name from clients where id = $1 and user_id = $2`,
      [data.clientId, context.userId],
    );
    if (!client[0]) fail("Cliente não encontrado.");

    const isNew = !data.id;
    const id = data.id ?? nid();
    const partsPrice = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const laborPrice = data.services.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const totalPrice = Math.max(0, partsPrice + laborPrice - data.discount);
    let previousPaid = 0;
    let orderNumber = 0;

    if (isNew) {
      orderNumber = await nextOrderNumber(db, context.userId);
      await db.query(
        `insert into service_orders (
           id, user_id, order_number, status, client_id, device_brand, device_model, device_serial, device_imei,
           defect_desc, accessories, diagnosis, solution, technician, warranty_days, labor_price, parts_price,
           discount, total_price, paid_amount, payment_method, notes, estimated_date
         ) values ($1,$2,$3,'RECEIVED',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [
          id,
          context.userId,
          orderNumber,
          data.clientId,
          data.deviceBrand.trim(),
          data.deviceModel.trim(),
          data.deviceSerial || null,
          data.deviceImei || null,
          data.defectDesc.trim(),
          data.accessories || null,
          data.diagnosis || null,
          data.solution || null,
          data.technician || null,
          data.warrantyDays,
          laborPrice,
          partsPrice,
          data.discount,
          totalPrice,
          data.paidAmount,
          data.paymentMethod || null,
          data.notes || null,
          data.estimatedDate || null,
        ],
      );
      await replaceLines(db, context.userId, id, data.items, data.services, false);
    } else {
      const existing = await db.query<{ paid_amount: unknown; order_number: number }>(
        `select paid_amount, order_number from service_orders where id = $1 and user_id = $2`,
        [id, context.userId],
      );
      if (!existing[0]) fail("Ordem não encontrada.");
      previousPaid = num(existing[0].paid_amount);
      orderNumber = num(existing[0].order_number);
      await db.query(
        `update service_orders set client_id=$1, device_brand=$2, device_model=$3, device_serial=$4, device_imei=$5,
         defect_desc=$6, accessories=$7, diagnosis=$8, solution=$9, technician=$10, warranty_days=$11,
         labor_price=$12, parts_price=$13, discount=$14, total_price=$15, paid_amount=$16, payment_method=$17,
         notes=$18, estimated_date=$19, updated_at=now()
         where id=$20 and user_id=$21`,
        [
          data.clientId,
          data.deviceBrand.trim(),
          data.deviceModel.trim(),
          data.deviceSerial || null,
          data.deviceImei || null,
          data.defectDesc.trim(),
          data.accessories || null,
          data.diagnosis || null,
          data.solution || null,
          data.technician || null,
          data.warrantyDays,
          laborPrice,
          partsPrice,
          data.discount,
          totalPrice,
          data.paidAmount,
          data.paymentMethod || null,
          data.notes || null,
          data.estimatedDate || null,
          id,
          context.userId,
        ],
      );
      await replaceLines(db, context.userId, id, data.items, data.services, true);
    }

    const order = await loadOrder(db, context.userId, id);
    const paidDelta = data.paidAmount - previousPaid;
    await recordSaleIfNeeded(
      db,
      context.userId,
      { id, orderNumber, clientName: client[0].name },
      paidDelta,
      data.paymentMethod || null,
      "Loja",
    );
    if (isNew) {
      await notifyOrder(db, context.userId, order, "OS_CREATED");
    }
    return order;
  });

export const changeOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), status: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const current = await loadOrder(db, context.userId, data.id);
    const next = data.status as ServiceOrderStatus;
    if (!STATUS_FLOW[current.status]?.includes(next)) {
      fail(`Transição inválida: ${STATUS_LABELS[current.status]} → ${STATUS_LABELS[next] ?? next}`);
    }
    const extra: string[] = ["status = $1", "updated_at = now()"];
    const params: unknown[] = [next];
    if (next === "DIAGNOSING" && !current.startedAt) extra.push("started_at = now()");
    if (next === "READY" && !current.finishedAt) extra.push("finished_at = now()");
    if (next === "DELIVERED" && !current.deliveredAt) extra.push("delivered_at = now()");
    params.push(data.id, context.userId);
    await db.query(
      `update service_orders set ${extra.join(", ")} where id = $${params.length - 1} and user_id = $${params.length}`,
      params,
    );
    const order = await loadOrder(db, context.userId, data.id);
    const type = next === "READY" ? "OS_READY" : next === "DELIVERED" ? "OS_DELIVERED" : "OS_STATUS_CHANGED";
    await notifyOrder(db, context.userId, order, type);
    return order;
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const existing = await db.query<{ status: string }>(
      `select status from service_orders where id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    if (!existing[0]) fail("Ordem não encontrada.");
    if (existing[0].status === "DELIVERED") fail("OS entregue não pode ser apagada.");
    await replaceLines(db, context.userId, data.id, [], [], true);
    await db.query(`delete from service_orders where id = $1 and user_id = $2`, [data.id, context.userId]);
    return { ok: true };
  });
