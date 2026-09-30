import { r as createServerFn } from "./ssr.mjs";
import { r as formatCurrency, t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { a as STATUS_LABELS } from "./domain-y13u448F.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { dn as boolean, gn as object, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { a as nid } from "./helpers-DClzb-S1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-BRR8n3vh.js
function formatPhone(phone) {
	let cleaned = phone.replace(/\D/g, "");
	if (cleaned.startsWith("55")) return cleaned;
	if (cleaned.length === 10 || cleaned.length === 11) return "55" + cleaned;
	return cleaned;
}
function buildTemplate(type, order) {
	const pending = formatCurrency(order.totalPrice - order.paidAmount);
	return {
		OS_CREATED: `*Advancecell — Nova OS #${order.orderNumber}*\n\nOlá ${order.clientName}!\nRecebemos seu ${order.deviceBrand} ${order.deviceModel} para análise.\nDefeito: ${order.defectDesc}\nOS: #${order.orderNumber}\n\nAcompanhe o status conosco. Obrigado pela confiança.`,
		OS_STATUS_CHANGED: `*Advancecell — Atualização OS #${order.orderNumber}*\n\nOlá ${order.clientName}!\nStatus do seu ${order.deviceBrand} ${order.deviceModel}: *${STATUS_LABELS[order.status]}*.\n\nAdvancecell Assistência Técnica`,
		OS_READY: `*Advancecell — OS #${order.orderNumber} pronta*\n\nOlá ${order.clientName}!\nSeu ${order.deviceBrand} ${order.deviceModel} está pronto para retirada.\n\nTotal: ${formatCurrency(order.totalPrice)}\nPago: ${formatCurrency(order.paidAmount)}\nA pagar: ${pending}\nGarantia: ${order.warrantyDays} dias.`,
		OS_DELIVERED: `*Advancecell — OS #${order.orderNumber} entregue*\n\nOlá ${order.clientName}!\nConfirmamos a entrega do seu ${order.deviceBrand} ${order.deviceModel}.\nGarantia de ${order.warrantyDays} dias a partir de hoje.\n\nAdvancecell Assistência Técnica`,
		PAYMENT_REMINDER: `*Advancecell — Lembrete de pagamento*\n\nOlá ${order.clientName}!\nSua OS #${order.orderNumber} possui valor pendente.\nTotal: ${formatCurrency(order.totalPrice)}\nPago: ${formatCurrency(order.paidAmount)}\nA pagar: ${pending}`,
		LOW_STOCK: "Alerta de estoque baixo.",
		CUSTOM: ""
	}[type];
}
async function notifyOrder(db, userId, order, type, customMessage) {
	const settings = await db.query(`select active from whatsapp_settings where user_id = $1`, [userId]);
	if (settings[0] && settings[0].active === false) return {
		sent: false,
		reason: "WhatsApp desativado"
	};
	const phone = order.clientWhatsapp || order.clientPhone;
	if (!phone) return {
		sent: false,
		reason: "Cliente sem telefone"
	};
	const message = customMessage || buildTemplate(type, order);
	const to = formatPhone(phone);
	await db.query(`insert into whatsapp_logs (id, user_id, type, phone_to, message, status, provider_id, service_order_id, client_id, sent_at)
     values ($1,$2,$3,$4,$5,'SENT',$6,$7,$8,now())`, [
		nid(),
		userId,
		type,
		to,
		message,
		`mock-${Date.now()}`,
		order.id,
		order.clientId
	]);
	return { sent: true };
}
var getWhatsApp = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("32a1dc34745788cf4efacc57184665716f537568cc21211b429a8a8cbcd51b94"));
var saveWhatsAppSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	phoneNumber: string(),
	active: boolean()
})).handler(createSsrRpc("be4530e36055fc39ef036b7cc3a14424987a6c1e9e78440f84c829d5446debee"));
var sendWhatsApp = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	orderId: string().optional(),
	phone: string().optional(),
	type: string(),
	message: string().optional()
})).handler(createSsrRpc("61560403c26e427ad31adfcdd8e13680eee68a1f971cc123274fff2dce9f4675"));
//#endregion
export { sendWhatsApp as i, notifyOrder as n, saveWhatsAppSettings as r, getWhatsApp as t };
