import type { Sql } from "@/lib/db";
import type { ServiceOrderStatus } from "@/lib/domain";
import type { OrderItem, OrderService, ServiceOrder } from "@/lib/types";
import { fail, iso, num } from "./helpers";

export async function loadOrderForNotify(db: Sql, userId: string, id: string): Promise<ServiceOrder> {
  const rows = await db.query<Record<string, unknown>>(
    `select o.*, c.name as client_name, c.phone as client_phone, c.whatsapp as client_whatsapp
     from service_orders o join clients c on c.id = o.client_id
     where o.id = $1 and o.user_id = $2`,
    [id, userId],
  );
  if (!rows[0]) fail("Ordem não encontrada.");
  const row = rows[0];
  const items = await db.query<Record<string, unknown>>(
    `select i.*, p.name as product_name from service_order_items i
     join products p on p.id = i.product_id
     where i.service_order_id = $1 and i.user_id = $2`,
    [id, userId],
  );
  const services = await db.query<Record<string, unknown>>(
    `select s.*, t.name as service_name from service_order_services s
     join service_types t on t.id = s.service_type_id
     where s.service_order_id = $1 and s.user_id = $2`,
    [id, userId],
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
