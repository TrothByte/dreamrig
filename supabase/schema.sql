-- DreamRig: схема данных (PostgreSQL / Supabase)
-- Хранится в репозитории; перенос на отдельный хостинг — заменой DATABASE_URL.
-- Правила: snake_case, явные CHECK-ограничения, RLS на всех таблицах,
-- триггеры SECURITY DEFINER с фиксированным search_path, индексы под hot-пути.

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Вспомогательные функции
-- ---------------------------------------------------------------------------

-- Автообновление updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Сотрудники (админка)
-- ---------------------------------------------------------------------------

create table if not exists public.staff (
  email citext primary key,
  role text not null default 'admin' check (role in ('admin', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.staff is 'Сотрудники с правами администрирования (RLS: is_admin())';

-- Администратор определяется через отдельную таблицу staff (а не хардкод в политиках)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.staff
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
      and active
  );
$$;

-- ---------------------------------------------------------------------------
-- Профили пользователей
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 120),
  alias citext check (char_length(alias) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_alias_unique unique nulls not distinct (alias)
);

create unique index if not exists profiles_email_key on public.profiles (email);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

-- Пользователь меняет только свои отображаемые поля; email/служебные колонки закрыты
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

revoke update (id, email, created_at, updated_at) on public.profiles from authenticated;
revoke update (id, email, created_at, updated_at) on public.profiles from anon;

-- Автосоздание профиля при регистрации (auth.users → profiles)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_first_name text := nullif(btrim(meta ->> 'first_name'), '');
  v_last_name text := nullif(btrim(meta ->> 'last_name'), '');
  v_alias text := nullif(btrim(meta ->> 'alias'), '');
begin
  insert into public.profiles (id, email, first_name, last_name, alias)
  values (
    new.id,
    lower(new.email),
    coalesce(v_first_name, 'Пользователь'),
    coalesce(v_last_name, 'Без фамилии'),
    v_alias
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        alias = coalesce(excluded.alias, public.profiles.alias),
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Товары
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 200),
  brand text not null check (char_length(brand) between 1 and 80),
  category text not null check (
    category in ('cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'cooling', 'case', 'peripherals')
  ),
  price integer not null check (price > 0),
  market_price integer not null check (market_price > 0 and market_price >= price),
  specs jsonb not null default '{}'::jsonb check (jsonb_typeof(specs) = 'object'),
  in_stock integer not null default 0 check (in_stock >= 0),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  description text not null check (char_length(description) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_in_stock_idx on public.products (in_stock desc) where in_stock > 0;
create index if not exists products_created_at_idx on public.products (created_at desc);
-- быстрый ilike-поиск по названию и бренду
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_brand_trgm_idx on public.products using gin (brand gin_trgm_ops);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

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
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Заказы
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer jsonb not null check (jsonb_typeof(customer) = 'object'),
  delivery jsonb not null check (jsonb_typeof(delivery) = 'object'),
  total integer not null check (total > 0),
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status) where status = 'new';

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

-- Анонимный чекаут: создать заказ может любой; читать/менять — только админ
create policy "orders_anonymous_insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (status = 'new');

create policy "orders_admin_all"
  on public.orders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Позиции заказов
-- ---------------------------------------------------------------------------

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  qty integer not null check (qty > 0 and qty <= 100),
  price_at_purchase integer not null check (price_at_purchase > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

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
  using (public.is_admin())
  with check (public.is_admin());

-- Аудит: сумма заказа в таблице orders не расходится с позициями
create or replace function public.assert_order_total()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_total integer;
  v_order_id bigint := coalesce(new.order_id, old.order_id);
begin
  select coalesce(sum(qty * price_at_purchase), 0)
    into v_total
    from public.order_items
   where order_id = v_order_id;

  update public.orders
     set total = v_total, updated_at = now()
   where id = v_order_id
     and status = 'new';

  return new;
end;
$$;

create trigger order_items_recalc_total
  after insert or update or delete on public.order_items
  for each row execute function public.assert_order_total();

-- ---------------------------------------------------------------------------
-- Серверное создание заказа (атомарно, цены и склад — из БД)
-- ---------------------------------------------------------------------------

create or replace function public.create_order(p_customer jsonb, p_delivery jsonb, p_items jsonb)
returns bigint
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_order_id bigint;
  v_total integer := 0;
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_price integer;
  v_stock integer;
begin
  if jsonb_typeof(p_customer) <> 'object' or jsonb_typeof(p_delivery) <> 'object'
     or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Некорректные данные заказа';
  end if;

  insert into public.orders (customer, delivery, total)
  values (p_customer, p_delivery, 1)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_qty := (v_item ->> 'qty')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Некорректное количество товара';
    end if;

    select price, in_stock into v_price, v_stock
      from public.products
     where id = v_product_id
     for update;

    if not found then
      raise exception 'Товар не найден';
    end if;
    if v_qty > v_stock then
      raise exception 'Доступно только % шт', v_stock;
    end if;

    insert into public.order_items (order_id, product_id, qty, price_at_purchase)
    values (v_order_id, v_product_id, v_qty, v_price);

    v_total := v_total + v_qty * v_price;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb, jsonb) to anon, authenticated;

-- Проверка прав текущего пользователя (для админки)
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select public.is_admin();
$$;

grant execute on function public.am_i_admin() to authenticated;
