# PROJECT STATE — DreamRig (сессионный статус)

> Читать первым в каждой новой сессии вместе с `docs/Agent.md` (мастер-план).
> Обновляй этот файл в конце каждой фазы/большой работы.

Обновлено: 2026-09-07. Актуальный тег: **v0.7.0**.

> Следующая большая работа: фаза 8 «Качество» (см. `docs/Agent.md`).

## Фаза 7 «Полировка и wow-слой» (v0.7.0) — сделано
- **Поиск в хедере**: `features/product-search` — debounce 300 мс, подсказки-дропдаун (топ-6, visual+цена, ARIA combobox/listbox), Enter → `/catalog?search=…`, на десктопе встроен в шапку, на мобильных — по иконке лупы.
- **Избранное**: сердечко на карточке товара, иконка счётчика в хедере, страница `/favorites`. Для загрузки добавлен `ProductRepository.getProductsByIds` (MSW `GET /api/products?ids=…`, Supabase `.in` с чанками по 100 и сохранением порядка). Порядок = порядку добавления.
- **404**: глитч-логотип (CSS-слои `::before/::after`, отключается при reduced-motion), CTA «На главную»/«В каталог».
- **Error Boundary**: `RouteErrorBoundary` вокруг каждого роута — экран «Что-то сломалось», кнопки «На главную» и «Скопировать ошибку».
- **Анимации** (пакет `motion` 13): fade+rise 180 мс при смене роута, stagger карточек каталога (30 мс/шаг), пружина счётчика корзины. Всё уважает `prefers-reduced-motion`.
- **Производительность/UX**: `React.lazy` для всех страниц (main-чанк ~636 KB вместо ~1.29 MB), скролл-восстановление (назад — на прежнюю позицию, вперёд — наверх), `scroll-behavior: smooth`, кастомный скроллбар в тон темы.
- DoD: «тётя-тест» и финальный проход тёмной темы пипеткой — **нужен человек** (модель без ввода изображений).
- Визуальную приёмку экранов делает человек (модель без ввода изображений).

## Быстрый вход в контекст
1. Правила и фазы: `docs/Agent.md`.
2. Этот файл — где мы остановились.
3. Живой сайт (демо, mock-режим): https://trothbyte.github.io/dreamrig/
4. Репозиторий: `TrothByte/dreamrig` (main, история линейная, ветки после merge удаляются).

## Статус фаз
| Фаза | Статус | Тег |
|---|---|---|
| 1 Каркас и деплой | ✅ | v0.1.0 |
| 2 Слой данных (mock+Supabase) | ✅ | v0.2.0 |
| 3 Каталог + главная | ✅ | v0.3.0 (+v0.3.1 редизайн каталога) |
| 4 Карточка товара | ✅ | v0.4.0 |
| 5 Корзина и чекаут | ✅ | v0.5.0 |
| 6 Админка на Supabase auth | ✅ | v0.6.0 |
| 7 Полировка и wow-слой | ✅ | v0.7.0 |
| 8 Качество (тесты/e2e/Lighthouse) | ⬜ | — |
| 9 Документация и релиз v1.0.0 | ⬜ | — |

Содержимое фаз 8–9 — в `docs/Agent.md` (строки ~166+).

Доп. фича вне фаз (после v0.6.0): раздел **«Блог»** `/blog` + `/blog/:slug` на едином контракте (mock + Supabase; обложки в `public/blog/`, атрибуция — `docs/blog-images.md`). Для supabase-режима нужны миграция из `supabase/schema.sql` и `pnpm seed:supabase`.

## Команды
- `pnpm dev` · `pnpm check` (biome+tsc) · `pnpm test --run` · `pnpm build` (копирует 404.html)
- `pnpm e2e` — появится в фазе 8 (Playwright ещё не настроен)
- Перед каждым коммитом: зелёный `pnpm check && pnpm test --run && pnpm build` (pre-commit: pnpm check)
- Коммиты conventional (husky+commitlint), одна задача = одна ветка = один коммит; merge → main только после зелёного CI; после merge пушить и ждать CI+Deploy.

## Окружение и секреты (НЕ в git)
- `.env` локально (gitignored) содержит:
  `VITE_API_MODE=supabase`, `VITE_SUPABASE_URL=https://xxztxjdjtstzibbmqdzp.supabase.co`,
  `VITE_SUPABASE_ANON_KEY=sb_publishable_…`,
  `SUPABASE_ACCESS_TOKEN=sbp_…` (для Management API/SQL),
  `SUPABASE_SERVICE_ROLE_KEY=` (пока пусто).
- Schema/RLS — код в `supabase/schema.sql` (данные живут в Supabase, в git не коммитятся).
- Admin: `admin@dreamrig.ru / admin1234`; демо-пользователь: `demo@dreamrig.ru / demo1234`.
- Email-подтверждение выключено; авто-триггер профиля создаёт строку в `profiles`.
- Деплой (Pages) и CI идут на моках без сети — живые ключи в CI не класть.

## Ключевые архитектурные решения (не ломать)
- **Два источника за единым контрактом** (zod): MSW (mock/dev/CI) и Supabase. Выбор через `getApiMode()`.
- FSD: app → pages → widgets → features → entities → shared; публичный API слайса — `index.ts`.
- Типы — только из zod (`z.infer`). Дизайн-токены — в `src/index.css` (@theme), тёмная тема по умолчанию.
- **Заказы создаются серверно**: `public.create_order()` (SECURITY DEFINER, цены/склад из БД) — RPC `/rest/v1/rpc/create_order`. Не возвращаться к прямым `INSERT…RETURNING` анонимом (RLS блокирует).
- **Админ**: роль по таблице `staff`, проверка `am_i_admin()`. Вход email+пароль (magic link невозможен без SMTP — отклонение от плана, задокументировано).
- **Корзина/избранное**: zustand+persist (`dreamrig-cart-v1`, `dreamrig-favorites`). Селекторы, возвращающие объект, — только через `useShallow` (Zustand v5, иначе бесконечный ре-рендер).
- Демо-режим (mock): аккаунты в памяти процесса; demo-пользователь = админ в mock.

## Известные ограничения / TODO на будущее
- **Реальные фото товаров отсутствуют** (контракт без imageUrl; по договорённости). Если появятся — добавить `imageUrl?` в zod/схему/репозиторий и `<img>` с fallback на `ProductVisual`.
- **Отзывы только в mock** (таблицы reviews в БД нет) — живые `getReviews` возвращают []. Решить в фазе 7/8, если нужно.
- ~~Бандл крупный (~1.29 MB main)~~ — исправлено в фазе 7: React.lazy по всем страницам (main ~636 KB).
- `supabase/database.types.ts` — временные ручные типы: заменить на `npx supabase gen types …`.
- Визуальную приёмку экранов делает человек (модель без ввода изображений).

## Фиксы, которые нельзя сломать
- CategoryNav — чипы это `<Link>` (кнопки+pointer-capture ломали клики).
- Корзина: `useShallow(selectCartTotals)` (был infinite rerender).
- Схема: `is_admin()` создаётся ПОСЛЕ `staff` (SQL-функция валидируется при создании).
- Orders: `total` placeholder 1 при вставке (CHECK total>0), затем пересчёт.

## Как продолжить в новой сессии
1. Прочитать `docs/Agent.md` + этот файл.
2. Проверить состояние main (`git status`, `git log -1`, последний CI на https://github.com/TrothByte/dreamrig/actions).
3. Сообщить пользователю план следующей фазы (7) и начать по правилам Части A (задача→ветка→гейт→коммит→CI→merge).
