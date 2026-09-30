//#region node_modules/.nitro/vite/services/ssr/assets/domain-y13u448F.js
var STATUS_LABELS = {
	RECEIVED: "Recebido",
	DIAGNOSING: "Diagnosticando",
	WAITING_APPROVAL: "Aguardando aprovação",
	IN_REPAIR: "Em reparo",
	READY: "Pronto",
	DELIVERED: "Entregue",
	CANCELLED: "Cancelado"
};
var STATUS_FLOW = {
	RECEIVED: ["DIAGNOSING", "CANCELLED"],
	DIAGNOSING: [
		"WAITING_APPROVAL",
		"IN_REPAIR",
		"CANCELLED"
	],
	WAITING_APPROVAL: [
		"IN_REPAIR",
		"CANCELLED",
		"DIAGNOSING"
	],
	IN_REPAIR: [
		"READY",
		"WAITING_APPROVAL",
		"CANCELLED"
	],
	READY: [
		"DELIVERED",
		"IN_REPAIR",
		"CANCELLED"
	],
	DELIVERED: [],
	CANCELLED: []
};
var MOVEMENT_LABELS = {
	OPENING: "Abertura",
	CLOSING: "Fechamento",
	SALE: "Venda",
	REFUND: "Estorno",
	SANGRIA: "Sangria",
	SUPRIMENTO: "Suprimento",
	EXPENSE: "Despesa"
};
var PAYMENT_METHODS = [
	"Dinheiro",
	"Pix",
	"Cartão de débito",
	"Cartão de crédito",
	"Transferência"
];
var MESSAGE_TYPE_LABELS = {
	OS_CREATED: "OS criada",
	OS_STATUS_CHANGED: "Status alterado",
	OS_READY: "OS pronta",
	OS_DELIVERED: "OS entregue",
	PAYMENT_REMINDER: "Lembrete de pagamento",
	LOW_STOCK: "Estoque baixo",
	CUSTOM: "Personalizada"
};
//#endregion
export { STATUS_LABELS as a, STATUS_FLOW as i, MOVEMENT_LABELS as n, PAYMENT_METHODS as r, MESSAGE_TYPE_LABELS as t };
