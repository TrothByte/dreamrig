# PROJECT STATE — DreamRig (сессионный статус)

> Читать первым в каждой новой сессии вместе с `docs/Agent.md` (мастер-план).
> Обновляй этот файл в конце каждой фазы/большой работы.

Обновлено: 2026-09-07. Актуальный тег: **v0.6.0** (фиксы после тега: `1f54e59` корзина).

> Недавняя фича вне фаз: раздел **«Блог»** (список + страница статьи, mock и Supabase) — детали ниже.

## Новое после v0.6.0: раздел «Блог»
- Роуты: `/blog` (список, фильтр по рубрикам `?rubric=news|review|guide`, «Показать ещё») и `/blog/:slug` (статья: обложка, тело из блоков, «Читайте также»).
- Контракт: `Article`/`ArticleBlock`/`ArticleRubric` в `src/shared/model/article.ts` (типы — только из zod). Репозиторий `ArticleRepository` → `MswArticleRepository` (GET `/api/articles…`) и `SupabaseArticleRepository`.
- 7 статей: `src/shared/api/mock/base-articles.ts` (реалистичный русский текст, рубрики: 2 обзора, 2 новости, 3 гайда). Обложки — в `public/blog/` (Wikimedia Commons, атрибуция в `docs/blog-images.md`), путь в БД — относительный `blog/…`, рендер через `assetUrl()` (учтён base `/dreamrig/`).
- Для живого режима нужно применить миграцию `supabase/schema.sql` (таблица `articles` + RLS: чтение всем, запись `is_admin()`) и запустить `pnpm seed:supabase` — он теперь грузит и статьи (service-ключ в `.env`). Без этого в supabase-режиме раздел пуст/ошибка; демо на GitHub Pages работает на моках.
- Хуки: `src/entities/article` (`useArticles/useArticle/useRelatedArticles`). UI: виджет `src/widgets/blog-grid`, ссылки «Блог» в хедере/футере + секция «Блог о железе» на главной.
- Визуальную приёмку обложек и экранов не делал (модель без ввода изображений) — проверить глазами.

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
| 7 Полировка и wow-слой | ⏭️ СЛЕДУЮЩАЯ | — |
| 8 Качество (тесты/e2e/Lighthouse) | ⬜ | — |
| 9 Документация и релиз v1.0.0 | ⬜ | — |

Содержимое фаз 7–9 — в `docs/Agent.md` (строки ~166+).

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
- Бандл крупный (~1.29 MB main): в фазе 7 — React.lazy по страницам и ленивый импорт supabase/admin.
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
