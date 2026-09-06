# Безопасность данных (проверка RLS)

Проверено на живом проекте Supabase (`xxztxjdjtstzibbmqdzp`).

## Выводы

- Все таблицы в `public` покрыты **Row Level Security**; анонимный и обычный
  пользователь не может писать данные напрямую через REST.
- Администратор определяется таблицей `staff` (role `admin`, `active`), проверка —
  `public.am_i_admin()` (SECURITY DEFINER, `search_path` зафиксирован). Клиентская
  роль не доверяется: права даёт только БД.

## Проверки из анонимной консоли (фактические ответы)

| Действие | Результат |
|---|---|
| `POST /rest/v1/products` (anon) | `42501 new row violates row-level security policy for table "products"` — запись запрещена |
| `POST /rest/v1/orders` (anon, `return=representation`) | RLS: INSERT проходит только с `status='new'`, чтение созданного заказа запрещено (SELECT нет у анонима) |
| `POST /rest/v1/orders` + `order_items` (anon, без representation) | Разрешено только создание заказа; `create_order()` — единственный путь с проверкой цены/склада |
| `profiles` чтение/запись | Только владелец (`auth.uid() = id`) или админ; служебные колонки закрыты `REVOKE UPDATE` |
| `am_i_admin()` (admin@dreamrig.ru) | `true` |
| `am_i_admin()` (demo@dreamrig.ru) | `false` |

## Правки схемы применены

- `supabase/schema.sql` — RLS-политики, триггеры (`handle_new_user`,
  `set_updated_at`, `assert_order_total`), функции `is_admin()`, `am_i_admin()`,
  `create_order()`, `staff`.
- Типографика схемы: ограничения CHECK, уникальные индексы (citext), GIN trigram
  для поиска, индексы на FK/hot-пути.

## Что проверять вручную

1. Выйти из аккаунта и открыть консоль браузера:
   `fetch('/rest/v1/products', {method:'POST', ...})` → 401/RLS-отказ.
2. Войти как `demo@dreamrig.ru` и открыть `/admin` → «Нет прав администратора».
3. Войти как `admin@dreamrig.ru / admin1234` → таблица товаров, создание/редактирование/удаление.
