import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { STATUS_LABELS, type WhatsAppMessageType } from "@/lib/domain";
import { formatCurrency } from "@/lib/utils";
import type { ServiceOrder, WhatsAppLog, WhatsAppSettings } from "@/lib/types";
import { iso, nid, sql } from "./helpers";
import { ensureShopSeeded } from "./seed";
import type { Sql } from "@/lib/db";

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("55")) return cleaned;
  if (cleaned.length === 10 || cleaned.length === 11) return "55" + cleaned;
  return cleaned;
}

export function buildTemplate(type: WhatsAppMessageType, order: ServiceOrder): string {
  const pending = formatCurrency(order.totalPrice - order.paidAmount);
  const templates: Record<WhatsAppMessageType, string> = {
    OS_CREATED:
      `*Advancecell — Nova OS #${order.orderNumber}*\n\n` +
      `Olá ${order.clientName}!\n` +
      `Recebemos seu ${order.deviceBrand} ${order.deviceModel} para análise.\n` +
      `Defeito: ${order.defectDesc}\n` +
      `OS: #${order.orderNumber}\n\n` +
      `Acompanhe o status conosco. Obrigado pela confiança.`,
    OS_STATUS_CHANGED:
      `*Advancecell — Atualização OS #${order.orderNumber}*\n\n` +
      `Olá ${order.clientName}!\n` +
      `Status do seu ${order.deviceBrand} ${order.deviceModel}: *${STATUS_LABELS[order.status]}*.\n\n` +
      `Advancecell Assistência Técnica`,
    OS_READY:
      `*Advancecell — OS #${order.orderNumber} pronta*\n\n` +
      `Olá ${order.clientName}!\n` +
      `Seu ${order.deviceBrand} ${order.deviceModel} está pronto para retirada.\n\n` +
      `Total: ${formatCurrency(order.totalPrice)}\n` +
      `Pago: ${formatCurrency(order.paidAmount)}\n` +
      `A pagar: ${pending}\n` +
      `Garantia: ${order.warrantyDays} dias.`,
    OS_DELIVERED:
      `*Advancecell — OS #${order.orderNumber} entregue*\n\n` +
      `Olá ${order.clientName}!\n` +
      `Confirmamos a entrega do seu ${order.deviceBrand} ${order.deviceModel}.\n` +
      `Garantia de ${order.warrantyDays} dias a partir de hoje.\n\n` +
      `Advancecell Assistência Técnica`,
    PAYMENT_REMINDER:
      `*Advancecell — Lembrete de pagamento*\n\n` +
      `Olá ${order.clientName}!\n` +
      `Sua OS #${order.orderNumber} possui valor pendente.\n` +
      `Total: ${formatCurrency(order.totalPrice)}\n` +
      `Pago: ${formatCurrency(order.paidAmount)}\n` +
      `A pagar: ${pending}`,
    LOW_STOCK: "Alerta de estoque baixo.",
    CUSTOM: "",
  };
  return templates[type];
}

export async function notifyOrder(
  db: Sql,
  userId: string,
  order: ServiceOrder,
  type: WhatsAppMessageType,
  customMessage?: string,
) {
  const settings = await db.query<{ active: boolean }>(
    `select active from whatsapp_settings where user_id = $1`,
    [userId],
  );
  if (settings[0] && settings[0].active === false) return { sent: false, reason: "WhatsApp desativado" };

  const phone = order.clientWhatsapp || order.clientPhone;
  if (!phone) return { sent: false, reason: "Cliente sem telefone" };

  const message = customMessage || buildTemplate(type, order);
  const to = formatPhone(phone);
  await db.query(
    `insert into whatsapp_logs (id, user_id, type, phone_to, message, status, provider_id, service_order_id, client_id, sent_at)
     values ($1,$2,$3,$4,$5,'SENT',$6,$7,$8,now())`,
    [nid(), userId, type, to, message, `mock-${Date.now()}`, order.id, order.clientId],
  );
  return { sent: true };
}

export const getWhatsApp = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ settings: WhatsAppSettings; logs: WhatsAppLog[] }> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    let settingsRows = await db.query<Record<string, unknown>>(
      `select * from whatsapp_settings where user_id = $1`,
      [context.userId],
    );
    if (!settingsRows[0]) {
      await db.query(
        `insert into whatsapp_settings (id, user_id, provider, phone_number, active) values ($1,$2,'MOCK','',true)`,
        [nid(), context.userId],
      );
      settingsRows = await db.query(`select * from whatsapp_settings where user_id = $1`, [context.userId]);
    }
    const s = settingsRows[0];
    const logs = await db.query<Record<string, unknown>>(
      `select * from whatsapp_logs where user_id = $1 order by created_at desc limit 80`,
      [context.userId],
    );
    return {
      settings: {
        id: String(s.id),
        provider: String(s.provider),
        phoneNumber: String(s.phone_number ?? ""),
        active: Boolean(s.active),
      },
      logs: logs.map((l) => ({
        id: String(l.id),
        type: l.type as WhatsAppMessageType,
        phoneTo: String(l.phone_to),
        message: String(l.message),
        status: String(l.status),
        providerId: (l.provider_id as string | null) ?? null,
        errorMessage: (l.error_message as string | null) ?? null,
        createdAt: iso(l.created_at) ?? "",
        sentAt: iso(l.sent_at),
      })),
    };
  });

export const saveWhatsAppSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ phoneNumber: z.string(), active: z.boolean() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    await db.query(
      `insert into whatsapp_settings (id, user_id, provider, phone_number, active)
       values ($1,$2,'MOCK',$3,$4)
       on conflict (user_id) do update set phone_number = excluded.phone_number, active = excluded.active`,
      [nid(), context.userId, data.phoneNumber, data.active],
    );
    return { ok: true };
  });

export const sendWhatsApp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      orderId: z.string().optional(),
      phone: z.string().optional(),
      type: z.string(),
      message: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    if (data.orderId) {
      const { loadOrderForNotify } = await import("./order-lookup");
      const order = await loadOrderForNotify(db, context.userId, data.orderId);
      return notifyOrder(db, context.userId, order, data.type as WhatsAppMessageType, data.message);
    }
    const phone = data.phone;
    if (!phone) throw new Error("Informe um telefone.");
    const message = data.message || "Mensagem Advancecell";
    await db.query(
      `insert into whatsapp_logs (id, user_id, type, phone_to, message, status, provider_id, sent_at)
       values ($1,$2,$3,$4,$5,'SENT',$6,now())`,
      [nid(), context.userId, data.type, formatPhone(phone), message, `mock-${Date.now()}`],
    );
    return { sent: true };
  });

