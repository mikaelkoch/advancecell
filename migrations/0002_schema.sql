create table if not exists shop_profiles (
  user_id text primary key,
  shop_name text not null default 'Advancecell',
  seeded_at timestamptz
);

create table if not exists categories (
  id text primary key,
  user_id text not null,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);
create index if not exists categories_user_id_idx on categories (user_id);

create table if not exists products (
  id text primary key,
  user_id text not null,
  category_id text not null references categories(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2) not null,
  cost_price numeric(10,2),
  stock int not null default 0,
  min_stock int not null default 5,
  sku text,
  barcode text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);
create index if not exists products_user_id_idx on products (user_id);

create table if not exists clients (
  id text primary key,
  user_id text not null,
  name text not null,
  email text,
  phone text not null,
  whatsapp text,
  cpf_cnpj text,
  address text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists clients_user_id_idx on clients (user_id);

create table if not exists service_types (
  id text primary key,
  user_id text not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_min int not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists service_types_user_id_idx on service_types (user_id);

create table if not exists service_orders (
  id text primary key,
  user_id text not null,
  order_number int not null,
  status text not null default 'RECEIVED',
  client_id text not null references clients(id),
  device_brand text not null,
  device_model text not null,
  device_serial text,
  device_imei text,
  defect_desc text not null,
  accessories text,
  diagnosis text,
  solution text,
  technician text,
  warranty_days int not null default 90,
  labor_price numeric(10,2) not null default 0,
  parts_price numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  paid_amount numeric(10,2) not null default 0,
  payment_method text,
  notes text,
  estimated_date date,
  started_at timestamptz,
  finished_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, order_number)
);
create index if not exists service_orders_user_id_idx on service_orders (user_id);
create index if not exists service_orders_status_idx on service_orders (user_id, status);

create table if not exists service_order_items (
  id text primary key,
  user_id text not null,
  service_order_id text not null references service_orders(id) on delete cascade,
  product_id text not null references products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists service_order_items_order_idx on service_order_items (service_order_id);

create table if not exists service_order_services (
  id text primary key,
  user_id text not null,
  service_order_id text not null references service_orders(id) on delete cascade,
  service_type_id text not null references service_types(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists service_order_services_order_idx on service_order_services (service_order_id);

create table if not exists cash_registers (
  id text primary key,
  user_id text not null,
  session_number int not null,
  status text not null default 'OPEN',
  opened_by text not null,
  closed_by text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_amount numeric(10,2) not null,
  closing_amount numeric(10,2),
  expected_amount numeric(10,2),
  difference numeric(10,2),
  notes text,
  unique (user_id, session_number)
);
create index if not exists cash_registers_user_id_idx on cash_registers (user_id);

create table if not exists cash_movements (
  id text primary key,
  user_id text not null,
  cash_register_id text not null references cash_registers(id) on delete cascade,
  type text not null,
  payment_method text,
  amount numeric(10,2) not null,
  description text,
  service_order_id text references service_orders(id),
  created_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists cash_movements_register_idx on cash_movements (cash_register_id);

create table if not exists whatsapp_settings (
  id text primary key,
  user_id text not null unique,
  provider text not null default 'MOCK',
  phone_number text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists whatsapp_logs (
  id text primary key,
  user_id text not null,
  type text not null,
  phone_to text not null,
  message text not null,
  status text not null default 'SENT',
  provider_id text,
  error_message text,
  service_order_id text,
  client_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists whatsapp_logs_user_id_idx on whatsapp_logs (user_id, created_at desc);
