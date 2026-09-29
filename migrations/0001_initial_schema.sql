-- Initial schema for Advancecell
-- This migration creates all core tables for the application

-- Create sequences FIRST (before tables that reference them)
-- Service Orders sequence
DO $$ BEGIN
    CREATE SEQUENCE IF NOT EXISTS service_orders_order_number_seq;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Cash Registers sequence
DO $$ BEGIN
    CREATE SEQUENCE IF NOT EXISTS cash_registers_session_number_seq;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    category_id TEXT NOT NULL REFERENCES categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    cpf_cnpj TEXT UNIQUE,
    address TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Types table
CREATE TABLE IF NOT EXISTS service_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 60,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Orders table
CREATE TABLE IF NOT EXISTS service_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number INTEGER UNIQUE NOT NULL DEFAULT nextval('service_orders_order_number_seq'::regclass),
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'DIAGNOSING', 'WAITING_APPROVAL', 'IN_REPAIR', 'READY', 'DELIVERED', 'CANCELLED')),
    client_id TEXT NOT NULL REFERENCES clients(id),
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    device_serial TEXT,
    device_imei TEXT,
    defect_desc TEXT NOT NULL,
    accessories TEXT,
    diagnosis TEXT,
    solution TEXT,
    technician TEXT,
    warranty_days INTEGER NOT NULL DEFAULT 90,
    labor_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    parts_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    estimated_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Order Items (products used in service)
CREATE TABLE IF NOT EXISTS service_order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service_order_id TEXT NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Order Services (services performed)
CREATE TABLE IF NOT EXISTS service_order_services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service_order_id TEXT NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    service_type_id TEXT NOT NULL REFERENCES service_types(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cash Register table
CREATE TABLE IF NOT EXISTS cash_registers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_number INTEGER UNIQUE NOT NULL DEFAULT nextval('cash_registers_session_number_seq'::regclass),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    opened_by TEXT NOT NULL,
    closed_by TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opening_amount NUMERIC(10, 2) NOT NULL,
    closing_amount NUMERIC(10, 2),
    expected_amount NUMERIC(10, 2),
    difference NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cash Movements table
CREATE TABLE IF NOT EXISTS cash_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cash_register_id TEXT NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('OPENING', 'CLOSING', 'SALE', 'REFUND', 'SANGRIA', 'SUPRIMENTO', 'EXPENSE')),
    payment_method TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    service_order_id TEXT REFERENCES service_orders(id),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WhatsApp Settings
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    provider TEXT NOT NULL DEFAULT 'MOCK' CHECK (provider IN ('MOCK', 'TWILIO', 'META', 'ZENVIA', 'WATI', 'GUPSHUP')),
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT NOT NULL,
    api_url TEXT,
    api_key TEXT,
    template_prefix TEXT DEFAULT 'advancecell',
    active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WhatsApp Logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL CHECK (type IN ('OS_CREATED', 'OS_STATUS_CHANGED', 'OS_READY', 'OS_DELIVERED', 'PAYMENT_REMINDER', 'LOW_STOCK', 'CUSTOM')),
    to_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    provider_id TEXT,
    error_message TEXT,
    service_order_id TEXT REFERENCES service_orders(id),
    client_id TEXT REFERENCES clients(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_service_orders_client ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_created ON service_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_service_order_items_order ON service_order_items(service_order_id);
CREATE INDEX IF NOT EXISTS idx_service_order_services_order ON service_order_services(service_order_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_register ON cash_movements(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_order ON whatsapp_logs(service_order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_client ON whatsapp_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON whatsapp_logs(created_at);