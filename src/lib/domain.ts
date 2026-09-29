export type ServiceOrderStatus =
  | "RECEIVED"
  | "DIAGNOSING"
  | "WAITING_APPROVAL"
  | "IN_REPAIR"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  RECEIVED: "Recebido",
  DIAGNOSING: "Diagnosticando",
  WAITING_APPROVAL: "Aguardando aprovação",
  IN_REPAIR: "Em reparo",
  READY: "Pronto",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const STATUS_FLOW: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  RECEIVED: ["DIAGNOSING", "CANCELLED"],
  DIAGNOSING: ["WAITING_APPROVAL", "IN_REPAIR", "CANCELLED"],
  WAITING_APPROVAL: ["IN_REPAIR", "CANCELLED", "DIAGNOSING"],
  IN_REPAIR: ["READY", "WAITING_APPROVAL", "CANCELLED"],
  READY: ["DELIVERED", "IN_REPAIR", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export type CashMovementType =
  | "OPENING"
  | "CLOSING"
  | "SALE"
  | "REFUND"
  | "SANGRIA"
  | "SUPRIMENTO"
  | "EXPENSE";

export const MOVEMENT_LABELS: Record<CashMovementType, string> = {
  OPENING: "Abertura",
  CLOSING: "Fechamento",
  SALE: "Venda",
  REFUND: "Estorno",
  SANGRIA: "Sangria",
  SUPRIMENTO: "Suprimento",
  EXPENSE: "Despesa",
};

export const PAYMENT_METHODS = ["Dinheiro", "Pix", "Cartão de débito", "Cartão de crédito", "Transferência"] as const;

export type WhatsAppMessageType =
  | "OS_CREATED"
  | "OS_STATUS_CHANGED"
  | "OS_READY"
  | "OS_DELIVERED"
  | "PAYMENT_REMINDER"
  | "LOW_STOCK"
  | "CUSTOM";

export const MESSAGE_TYPE_LABELS: Record<WhatsAppMessageType, string> = {
  OS_CREATED: "OS criada",
  OS_STATUS_CHANGED: "Status alterado",
  OS_READY: "OS pronta",
  OS_DELIVERED: "OS entregue",
  PAYMENT_REMINDER: "Lembrete de pagamento",
  LOW_STOCK: "Estoque baixo",
  CUSTOM: "Personalizada",
};

export function isStatus(value: string): value is ServiceOrderStatus {
  return value in STATUS_LABELS;
}
