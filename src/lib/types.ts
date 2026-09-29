import type {
  CashMovementType,
  ServiceOrderStatus,
  WhatsAppMessageType,
} from "./domain";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  costPrice: number | null;
  stock: number;
  minStock: number;
  sku: string | null;
  barcode: string | null;
  active: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  cpfCnpj: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  orderCount: number;
  createdAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMin: number;
  active: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderService {
  id: string;
  serviceTypeId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface ServiceOrder {
  id: string;
  orderNumber: number;
  status: ServiceOrderStatus;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp: string | null;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial: string | null;
  deviceImei: string | null;
  defectDesc: string;
  accessories: string | null;
  diagnosis: string | null;
  solution: string | null;
  technician: string | null;
  warrantyDays: number;
  laborPrice: number;
  partsPrice: number;
  discount: number;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: string | null;
  notes: string | null;
  estimatedDate: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  services: OrderService[];
}

export interface CashMovement {
  id: string;
  type: CashMovementType;
  paymentMethod: string | null;
  amount: number;
  description: string | null;
  serviceOrderId: string | null;
  orderNumber: number | null;
  createdBy: string;
  createdAt: string;
}

export interface CashRegister {
  id: string;
  sessionNumber: number;
  status: "OPEN" | "CLOSED";
  openedBy: string;
  closedBy: string | null;
  openedAt: string;
  closedAt: string | null;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  notes: string | null;
  movements: CashMovement[];
  summary: {
    sales: number;
    refunds: number;
    sangrias: number;
    suprimentos: number;
    expenses: number;
    expectedClosing: number;
    salesByMethod: Record<string, number>;
  };
}

export interface WhatsAppLog {
  id: string;
  type: WhatsAppMessageType;
  phoneTo: string;
  message: string;
  status: string;
  providerId: string | null;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface WhatsAppSettings {
  id: string;
  provider: string;
  phoneNumber: string;
  active: boolean;
}
