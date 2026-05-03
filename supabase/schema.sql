create extension if not exists pgcrypto;

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity text,
  color text,
  condition text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create table if not exists payment_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create table if not exists apple_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  memo text,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  status text not null default '発注済み',
  order_date date,
  purchase_price integer default 0,
  supplier_id uuid references suppliers(id),
  delivery_date date,
  payment_account_id uuid references payment_accounts(id),
  apple_account_id uuid references apple_accounts(id),
  earned_points integer default 0,
  serial_number text,
  order_number text,
  buyer_id uuid references buyers(id),
  sale_price integer default 0,
  transfer_date date,
  shipping_fee integer default 0,
  commission integer default 0,
  other_expenses integer default 0,
  sold_date date,
  memo text,
  deleted_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists managed_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  purchase_date date not null,
  purchase_source text not null,
  purchase_price integer not null default 0,
  sell_source text,
  sell_expected_price integer not null default 0,
  sell_price integer,
  points integer,
  shipping_cost integer,
  fee integer,
  memo text,
  status text not null default 'ordered' check (status in ('ordered', 'arrived', 'sold', 'canceled')),
  sold_date date,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

drop trigger if exists set_products_updated_at on products;
create trigger set_products_updated_at
before update on products
for each row
execute function update_updated_at_column();

drop trigger if exists set_suppliers_updated_at on suppliers;
create trigger set_suppliers_updated_at
before update on suppliers
for each row
execute function update_updated_at_column();

drop trigger if exists set_buyers_updated_at on buyers;
create trigger set_buyers_updated_at
before update on buyers
for each row
execute function update_updated_at_column();

drop trigger if exists set_payment_accounts_updated_at on payment_accounts;
create trigger set_payment_accounts_updated_at
before update on payment_accounts
for each row
execute function update_updated_at_column();

drop trigger if exists set_apple_accounts_updated_at on apple_accounts;
create trigger set_apple_accounts_updated_at
before update on apple_accounts
for each row
execute function update_updated_at_column();

drop trigger if exists set_orders_updated_at on orders;
create trigger set_orders_updated_at
before update on orders
for each row
execute function update_updated_at_column();

drop trigger if exists set_managed_products_updated_at on managed_products;
create trigger set_managed_products_updated_at
before update on managed_products
for each row
execute function update_updated_at_column();

alter table if exists apple_accounts enable row level security;
drop policy if exists "allow all" on apple_accounts;
create policy "allow all" on apple_accounts for all using (true);
