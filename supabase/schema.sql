-- DreamRig: схема данных для Supabase (живой источник за контрактом mock-репозитория)

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  category text not null
    check (category in ('cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'cooling', 'case', 'peripherals')),
  price integer not null check (price > 0),
  market_price integer not null check (market_price > 0 and market_price >= price),
  specs jsonb not null default '{}'::jsonb,
  in_stock integer not null default 0 check (in_stock >= 0),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_admin_write"
  on public.products
  for all
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru');

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer jsonb not null,
  delivery jsonb not null,
  total integer not null check (total > 0),
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_anonymous_insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

create policy "orders_admin_all"
  on public.orders
  for all
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru');

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty integer not null check (qty > 0),
  price_at_purchase integer not null check (price_at_purchase > 0)
);

alter table public.order_items enable row level security;

create policy "order_items_anonymous_insert"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

create policy "order_items_admin_all"
  on public.order_items
  for all
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'admin@dreamrig.ru');
