
AGENTS.md — DreamRig: мастер-план разработки
> СЕССИОННЫЙ СТАТУС (где мы остановились): см. docs/PROJECT_STATE.md — читать его первым.
Ты — senior frontend-разработчик, единолично ведущий проект DreamRig под моим руководством.Этот файл — единый источник истины. Перечитывай его в начале каждой сессии.Работай строго по фазам. Не переходи к следующей фазе, пока текущая не прошла DoD.

ЧАСТЬ A. ПРАВИЛА РАБОТЫ (нарушение любого пункта = брак)
A1. Одна задача = одна ветка (feat/..., fix/..., chore/...) = один коммит.A2. Коммиты — conventional commits: feat(cart): фильтр по наличию. Никаких «update», «fixes», «asd».A3. Перед КАЖДЫМ коммитом добейся зелёного состояния: pnpm check && pnpm test --run && pnpm build.A4. Merge в main — только после зелёного CI. После merge — тег версии в конце фазы.A5. ЗАПРЕЩЕНО: добавлять зависимости без моего явного разрешения; использовать any; @ts-ignore; eslint-disable/biome-ignore без обсуждения; lorem ipsum; выдуманные библиотеки; emoji вместо иконок; loading через useEffect + fetch (только TanStack Query).A6. Все тексты UI, описания, отзывы — на русском языке, реалистичные. Никакого lorem.A7. Типы — только из zod-схем через z.infer. Ручное дублирование типов запрещено.A8. Не трогай файлы вне зоны текущей задачи. Не делай незапрошенных рефакторингов.A9. Если задача непонятна — задай вопрос и остановись. Если провалил задачу дважды — декомпозируй её и покажи мне план из подзадач.A10. В конце каждой задачи выдавай отчёт: список изменённых файлов + что сделано + текст коммита.A11. Node 20+, pnpm. Пакетный менеджер не менять.A12. Секреты в код не попадают никогда. Всё через .env (в git — только .env.example).

ЧАСТЬ B. КОНТЕКСТ ПРОДУКТА
DreamRig — интернет-магазин компьютерного железа и периферии.Слоган: «Собери риг мечты по цене мечты».Фишка: все товары продаются НИЖЕ среднерыночной цены. У каждого товара есть price(наша цена) и marketPrice (средняя по рынку). В UI: зачёркнутая рыночная цена + бейдж «−N%».Язык интерфейса: русский. Валюта: рубли, целые числа, формат 74 990 ₽.

Архитектурная особенность: бэкенда нет. Два взаимозаменяемых источника данных за единымконтрактом (zod): MSW (моки, для разработки/CI/e2e) и Supabase (живой Postgres, для демо).Переключение — переменной VITE_API_MODE=mock|supabase.

ЧАСТЬ C. СТЕК И КОМАНДЫ (НЕ МЕНЯТЬ)
React 19 + TypeScript strict + Vite
Tailwind CSS v4 (конфигурация через @theme в CSS, НЕ через tailwind.config.js)
shadcn/ui (компоненты кладём в src/shared/ui)
Zustand (persist для корзины/избранного/темы)
TanStack Query v5 (вся серверная логика)
react-hook-form + zod (формы)
MSW + @faker-js/faker/locale/ru (моки и генерация данных)
@supabase/supabase-js (живой источник)
Biome (lint + format), Vitest, Playwright
motion (анимации), lucide-react (иконки), sonner (тосты)
Команды:

pnpm dev — dev-сервер
pnpm check — biome + tsc
pnpm test --run — юнит-тесты
pnpm e2e — Playwright
pnpm build — прод-сборка (внутри также копирует index.html → 404.html)
Переменные окружения (.env.example коммитим, .env — нет):

VITE_API_MODE=mockVITE_SUPABASE_URL=VITE_SUPABASE_ANON_KEY=
ЧАСТЬ D. АРХИТЕКТУРА: FEATURE-SLICED DESIGN
src/  app/        # роутер, провайдеры (QueryClient, тема, тосты), глобальные стили  pages/      # home, catalog, product, cart, checkout, admin, not-found  widgets/    # header, footer, filters-panel, product-grid, cart-view, hero, checkout-steps  features/   # add-to-cart, toggle-favorite, product-filters, product-search,              # checkout-form, admin-auth, admin-product-form  entities/   # product, cart, favorite, order, review  shared/     # ui (shadcn), api (репозитории, msw, supabase-клиент), model (zod-схемы),              # lib (форматтеры, утилиты), config (env)
Правила:

Импорты только СВЕРХУ ВНИЗ: app → pages → widgets → features → entities → shared.Слои ниже не импортируют слои выше. Нарушение = переделать.
Внутри слайса сегменты: ui / model / api.
Публичный API слайса — файл index.ts. Прямые импорты из чужих внутренностей запрещены.
ЧАСТЬ E. ДИЗАЙН-СИСТЕМА «DREAMRIG DARK» (уникальность и дорогой вид)
Референсы уровня: Linear.app, Vercel, Stripe. Стиль: глубокий графит, один неоновый акцент,моноширинные цифры, много воздуха, тихие микроанимации.

Токены (объявить в @theme, поддержать тёмную и светлую темы)
--bg:        #0A0A0B   (никогда чистый #000)--surface:   #141417--surface-2: #1C1C21--border:    rgba(255,255,255,0.08)--text:      #F4F4F5--muted:     #8B8B93--accent:    #A3E635   (лайм. ТОЛЬКО для действий: кнопки CTA, ссылки-действия, бейдж скидки)--accent-soft: rgba(163,230,53,0.12)--danger:    #F87171--warn:      #FBBF24Светлая тема: bg #FAFAFA, surface #FFFFFF, border rgba(0,0,0,0.08), text #18181B, тот же акцент.Тёмная тема — по умолчанию. Выбор темы сохраняется в localStorage, без «мигания» при загрузке.
Типографика
Текст: Inter. Заголовки: font-semibold tracking-tight.
Цены, артикулы, счётчики: JetBrains Mono + tabular-nums (цифры не «прыгают»).
Шкала размеров только: 12 / 14 / 16 / 20 / 24 / 32 / 40. Промежуточные не изобретать.
Воздух и форма
Отступы кратны 4. Карточка товара: padding 20–24px. Секции: 64–96px по вертикали.
Радиусы: скругления ОДНОГО семейства — карточки 12–16, кнопки 10, бейджи full.
Тени только мягкие тёмные: 0 8px 24px rgba(0,0,0,0.35). Цветное свечение — толькоhover у главной CTA (0 0 24px var(--accent-soft)).
Хедер: backdrop-blur + полупрозрачный --bg. Это единственное «стекло» на сайте.
Движение
150–250 мс, ease-out. Анимировать ТОЛЬКО transform/opacity.
Карточка: hover → translateY(-2px) + тень. Кнопка: active → scale(0.98).
Скелетоны с shimmer вместо спиннеров во всех списках.
Обязательно уважать prefers-reduced-motion.
Состояния (проверять у КАЖДОГО экрана)
У каждого интерактивного элемента: hover, focus-visible (кольцо 2px accent), active, disabled, loading.
У каждого списка: skeleton (загрузка) / empty (иконка + заголовок + подсказка + кнопка «Сбросить фильтры») / error (сообщение + кнопка «Повторить»).
Мобильная версия от 375px — проверять каждый экран.
Визуал товаров (вместо фото — фича стиля)
Компонент ProductVisual: SVG-плитка = мягкий градиент фона по категории + крупнаяиконка lucide + тонкая сетка-паттерн 8px. Соотношение 4:3.Маппинг категорий: cpu→Cpu, gpu→Microchip, ram→MemoryStick, storage→HardDrive,motherboard→CircuitBoard, psu→Zap, cooling→Fan, case→Box, peripherals→Keyboard.Фотографии стоковые НЕ использовать.

Запрещено (мгновенно удешевляет)
Чистый чёрный/белый, дефолтный синий #3B82F6 как акцент, фиолетовые градиенты, emojiкак иконки, два и более акцентных цвета, анимации длиннее 300 мс, тесные отступы,спиннеры в списках, разные радиусы на одном экране.

Чек-лист приёмки экрана (агент прогоняет перед коммитом UI)
[ ] Обе темы работают и красивы [ ] 375px не разваливается [ ] все состояния есть[ ] focus-visible с клавиатуры [ ] цены моно + tabular-nums [ ] воздух по токенам[ ] иконки lucide, stroke 1.75, размеры 16/20/24 [ ] анимации ≤250мс

ЧАСТЬ F. КОНТРАКТ ДАННЫХ
Категории (enum): cpu | gpu | ram | storage | motherboard | psu | cooling | case | peripherals

Zod-схема товара (shared/model/product.ts), типы выводятся из неё:

Product {  id: uuid; slug: string; name: string; brand: string;  category: Category; price: int > 0; marketPrice: int > 0;   # marketPrice >= price  specs: Record<string, string>; inStock: int >= 0;  rating: 0..5; reviewsCount: int; description: string; createdAt: iso-date}Review { id, productSlug, author, rating 1..5, text, createdAt }Order  { id, customer {name, phone, email}, delivery {city, address, comment?},         items: {productId, qty, priceAtPurchase}[], total, status: 'new', createdAt }
Репозиторий (shared/api/product-repo.ts) — интерфейс + две реализации:

getProducts(params: {category?, brands?, priceMin?, priceMax?, inStockOnly?,                     search?, sort?, page, pageSize=24}) -> {items, total, page, pageSize}getProductBySlug(slug) -> Product | nullgetReviews(slug) -> Review[]getSimilar(slug, limit=4) -> Product[]createOrder(payload) -> {id}
Выбор реализации: import.meta.env.VITE_API_MODE === 'supabase' ? supabaseRepo : mswRepo.Весь доступ к данным — через репозиторий. Компоненты напрямую msw/supabase не импортируют.

ФАЗЫ РАЗРАБОТКИ
ФАЗА 1. Каркас и деплой с первого дня (тег v0.1.0)
Задачи:

pnpm create vite . --template react-ts (в текущей папке), strict в tsconfig.
Biome: biome.json (semi: false, 100 символов), VS Code-настройки в .vscode/.
Tailwind v4 через @tailwindcss/vite, все токены из Части E в @theme (обе темы).
Подключить shadcn/ui, калибровать его токены под нашу палитру.
Скелет FSD по Части D, файлы-заглушки index.ts в слайсах.
Роутер (react-router): маршруты /, /catalog, /product/:slug, /cart,/checkout, /admin, * → not-found. Страницы-заглушки с заголовком.
Widgets: Header (лого DreamRig, ссылки, переключатель темы, иконки избранного и корзинысо счётчиками-бейджами) + Footer. Backdrop-blur по Части E.
ThemeProvider: dark по умолчанию, persist, без FOUC (инлайн-скрипт в index.html).
Husky + commitlint (pre-commit: pnpm check).
CI .github/workflows/ci.yml: на каждый push — check + test + build.
Deploy .github/workflows/deploy.yml: после CI — деплой dist на GitHub Pages(Source: GitHub Actions, permissions pages:write, id-token:write).
vite.config.ts: base: '/dreamrig/'. Скрипт build копирует dist/index.html → dist/404.html(использовать shx — кроссплатформенно).
.env.example, README-скелет (название, слоган, стек, бейдж CI), favicon (лаймовый«срез ядра» — простая SVG-метка DR), og-метатеги, шрифты Inter + JetBrains Mono(self-hosted через @fontsource, без CDN).
DoD: сайт открывается по живой ссылке username.github.io/dreamrig/ с телефона, тёмная тема,переключатель работает, CI и Deploy зелёные, прямая ссылка на /catalog не даёт 404.

ФАЗА 2. Слой данных: моки + живая БД за одним контрактом (тег v0.2.0)
Задачи:

Zod-схемы по Части F + утилита discountPercent(price, marketPrice) + форматтер ценыIntl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits: 0 }).
Seed: файл src/shared/api/mock/base-products.ts — 60 реальных SKU, распределённых по всем9 категориям. Реальные модели 2023–2025 (RTX 4070 Super, Ryzen 7 7800X3D, DDR5-6000,WD SN850X, Deepcool AK620, Lian Li Lancool 216 и т.д.), правдоподобные рублёвые цены,marketPrice на 8–25% выше price, specs на русском («Ядра/потоки: 8/16»).
Генератор generateCatalog(): размножает базу до ~320 товаров (варианты объёмов,производители, сток), генерирует 3–6 отзывов на товар на РУССКОМ языке (реальные имена,живые тексты: «Тихий, держит 5.2 ГГц на всех ядрах, доволен» — никаких lorem).Slug из имени, детерминированный seed faker, чтобы данные были стабильны между запусками.
MSW: хендлеры GET /api/products (фильтрация, сортировка, пагинация НА СТОРОНЕ хендлера —клиент получает только страницу), GET /api/products/:slug, GET /api/products/:slug/reviews,GET /api/products/:slug/similar, POST /api/orders. Задержка delay(250–400).worker.start() только при VITE_API_MODE=mock.
Supabase: supabase/schema.sql:
products (uuid pk, slug unique, name, brand, category, price int check >0, market_price,specs jsonb, in_stock, rating, reviews_count, description, created_at)
orders (bigint identity pk, customer jsonb, delivery jsonb, total, status, created_at)
order_items (order_id fk, product_id fk, qty check >0, price_at_purchase)
RLS: products — SELECT всем; orders — INSERT всем (анонимный чекаут), SELECT/UPDATE/DELETE — нет;
admin-политика через auth.jwt() ->> 'email'.
Seed-скрипт scripts/seed-supabase.ts: заливает каталог через supabase-js (service key из envскрипта, НЕ из VITE_). В README — команда запуска.
supabaseRepo — реализация интерфейса на supabase-js (фильтры/сортировка/пагинация средствамиБД, .range()). Типы БД: npx supabase gen types typescript.
Хуки TanStack Query: useProducts(params), useProduct(slug), useReviews(slug),useSimilar(slug), useCreateOrder(). queryKey — сериализованные параметры.
Keep-alive .github/workflows/keep-alive.yml: cron раз в сутки, curl к REST Supabase(URL и anon key через GitHub Secrets).
DoD: страница /catalog рендерит реальные товары с skeletons; в .env переключениеVITE_API_MODE меняет источник без ошибок в консоли; CI проходит на моках без сети;схема и RLS лежат в репозитории.

ФАЗА 3. Каталог + главная (тег v0.3.0)
Задачи:

ProductCard: ProductVisual, название (2 строки max, line-clamp), бренд-чип, рейтинг(звёзды + число), цена моно крупно, зачёркнутая marketPrice мелко muted, бейдж «−N%»(accent-soft фон, accent текст), «В наличии: N шт» или «Под заказ». Hover по Части E.
FiltersPanel (widgets): категории — сегмент-табы с иконками; бренды — чекбоксы;цена — двухползунковый слайдер; тумблер «Только в наличии»; кнопка «Сбросить».
Вся состояние каталога — В URL: ?category=gpu&brand=asus&brand=msi&priceMin=20000& priceMax=100000&inStock=1&sort=price_asc&page=2&search=rtx. Ссылка шаркабельна, F5сохраняет вид. Работа с URL через хук useCatalogParams.
Сортировка (популярные / цена ↑ / цена ↓ / рейтинг / новинки) и пагинация — тоже в URL.Пагинация: кнопки «‹ 1 2 3 … 14 ›», не бесконечный скролл.
Состояния: skeletons при загрузке, empty «Ничего не найдено» + «Сбросить фильтры»,error + «Повторить». Счётчик «Найдено 128 товаров». Крошки: Главная / Каталог / Категория.
Главная /: Hero (крупный заголовок «Собери риг мечты по цене мечты», подзаголовок,CTA «Перейти в каталог», мини-статы: «320+ товаров · −18% к рынку в среднем»), ниже —сетка категорий с иконками, затем «Горящие цены» — 8 товаров с максимальной скидкой(переиспользовать ProductCard), полоса trust-бейджей (Гарантия 24 мес / Доставка 1–3 дня /Цены ниже рынка). Всё на данных из репозитория.
Адаптив: 4 колонки → 2 (≤1024) → 1 (≤640). Фильтры на мобилке — выдвижная панель снизу.
DoD: URL из примера п.3 открывает ровно описанное; переключение фильтров без «мигания»(кеши Query, placeholderData: keepPreviousData); чек-лист Части E пройден на обоих экранах.

ФАЗА 4. Карточка товара (тег v0.4.0)
Задачи:

Layout: слева ProductVisual крупный (+ миниатюры-оттенки, чисто визуально), справа —name, бренд, рейтинг, блок цены (наша крупно моно, рыночная зачёркнута, бейдж −N%),наличие, кнопки «В корзину» (accent, крупная) и «В избранное» (ghost, иконка).
Таблица specs из jsonb (зебра-строки, колонка параметр/значение), описание.
Отзывы: средний рейтинг крупно + распределение по звёздам + список карточек отзывов(аватар-инициалы, имя, дата через Intl.DateTimeFormat, звёзды, текст).
«Похожие товары» — горизонтальный ряд из 4 ProductCard той же категории.
Кнопка «В корзину»: optimistic-добавление + тост sonner «Добавлено в корзину» +бейдж-счётчик в хедере обновляется мгновенно.
Метатеги title/description от товара. Несуществующий slug → роут на not-found.
Хлебные крошки: Главная / Каталог / GPU / RTX 4070 Super.
DoD: прямой заход по URL товара из адресной строки работает (проверить на проде последеплоя — это тест 404-трюка); нет сдвигов layout при загрузке (зарезервированы размеры).

ФАЗА 5. Корзина и чекаут — сквозной сценарий (тег v0.5.0)
Задачи:

Zustand store cart: items, add/remove/setQty/clear, persist в localStorage.Валидация: qty ≤ inStock товара (иначе тост «Доступно только N шт»).
Страница корзины: строки (visual, name, цена моно, степпер количества, сумма, удалить),итоги справа (товаров, скидка относительно marketPrice — «Ваша выгода: 12 400 ₽», итого),CTA «Оформить заказ». Пустая корзина — empty-state с CTA в каталог.
Чекаут в 3 шага (CheckoutSteps): 1) Контакты (имя, телефон, email) 2) Доставка(город, адрес, комментарий) 3) Подтверждение (сводка + итого). react-hook-form + zod(телефон маской-паттерном), прогресс-индикатор шагов, кнопки Назад/Далее, состояниесохраняется между шагами.
Сабмит: createOrder() в активный репозиторий → экран успеха: крупная галочка-анимация,«Заказ №1024 оформлен», «Мы позвоним для подтверждения», номер — РЕАЛЬНЫЙ id из БД.Защита от двойного сабмита (кнопка в loading), error-состояние с «Повторить».
После успешного заказа корзина очищается.
DoD (ГЛАВНЫЙ ВЕХА): «каталог → фильтр GPU → товар → в корзину 2 шт → чекаут → заказ №Nна экране → запись видна в таблице Supabase» — без единой ошибки. При VITE_API_MODE=mockсценарий проходит на моках (для e2e).

ФАЗА 6. Админка на Supabase auth (тег v0.6.0)
Задачи:

feature admin-auth: вход по magic link (email). Неавторизованный на /admin — экран«Войдите как администратор» (не редирект-петля). Хедер: скрытая иконка входа в футере.
Таблица товаров: поиск по названию, фильтр по категории, колонки (visual-mini, name,category, price, marketPrice, дельта-бейдж, in_stock, действия). Пагинация. Кнопка«Добавить товар».
Форма товара: те же zod-схемы, что везде (single source of truth); auto-slug из имени;specs — редактор пар «ключ-значение» (добавить/удалить строку); категории — select сиконками; валидация marketPrice ≥ price. Режимы: создать / редактировать / дублировать.
Мутации через supabase-js от имени авторизованного + инвалидация queryClient(invalidateQueries по ключам products). Тосты об успехе/ошибке.
Проверка безопасности (задокументировать результат в docs/security.md): из анонимнойконсоли браузера попытка INSERT/UPDATE/DELETE — должна быть ОТКЛОНЕНА RLS. Скрин в доку.
DoD: добавленный товар появляется в каталоге через ~2 сек (деплой не нужен — данные живые);аноним не может изменить данные даже напрямую через консоль.

ФАЗА 7. Полировка и wow-слой (тег v0.7.0)
Задачи:

Поиск в хедере: debounce 300 мс, подсказки-дропдаун (топ-6 совпадений с visual и ценой),Enter → /catalog?search=... Результаты тоже через репозиторий.
Избранное: zustand persist, тоггл-сердечко на карточке и в товаре, страница /favorites.
Кастомная 404: крупный глитч-логотип, «Страница не найдена», CTA домой.
Error Boundary на каждый роут: экран «Что-то сломалось» + кнопка «На главную» +кнопка «Скопировать ошибку».
Анимации: переходы между роутами (motion, fade+rise 180мс), stagger появления карточеккаталога (30мс шаг), счётчики корзины «пружинят». Всё с уважением reduced-motion.
React.lazy для каждой страницы (code splitting), скролл-восстановление при навигации,кастомный скроллбар в тон темы, scroll-behavior: smooth.
Тёмная тема: финальный проход пипеткой по всем экранам обеих тем — ноль контрастныхпровалов. Проверить чек-лист Части E на КАЖДОМ экране.
DoD: «тётя-тест» — 10 минут хаотичных кликов не находят ни одного сломанного/некрасивогосостояния; Lighthouse Performance ≥ 85 уже сейчас (финал в фазе 8).

ФАЗА 8. Качество (тег v0.8.0)
Задачи:

Vitest ≥ 20 тестов: cart (добавление, лимит склада, пересчёт, выгода), discountPercent,форматтер цены, парсинг/сериализация каталог-параметров URL, мок-хендлеры (фильтрация,сортировка, пагинация).
Playwright e2e (против MSW, продовая сборка через preview): «открыл каталог → отфильтровалGPU → открыл товар → добавил в корзину → прошёл чекаут → увидел номер заказа».Плюс короткий тест смены темы и 404.
CI: добавить e2e-джобу. Тег в README: статус CI.
Lighthouse на проде: Performance/Accessibility/Best Practices/SEO ≥ 90. Скрины → docs/quality.md.
A11y-проход: навигация с клавиатуры по всему флоу покупки, aria-label на всехиконочных кнопках, видимые focus-кольца, контраст текста.
(Опционально, если я одобрил) Sentry free tier.
DoD: полный зелёный пайплайн на каждый push; quality.md со скринами Lighthouse.

ФАЗА 9. Документация и релиз (тег v1.0.0)
Задачи:

README финальный: бейджи (CI, deploy), 3–5 скриншотов (обе темы, каталог, чекаут),схема FSD, «Запуск за 3 команды», ссылка на живой сайт, архитектурный раздел(«два источника за единым контрактом», «типы из zod/БД»).
docs/adr/: 6 записей коротко (стек; FSD; MSW+Supabase за контрактом; RLS вместосервера; SPA и ограничение SEO — путь роста Next.js; отказ от аккаунтов покупателя).
docs/ai-journal.md: по фазам — задача → подход → что отклонено на ревью.
CHANGELOG.md по фазам. GitHub Release v1.0.0.
Демо-скрипт docs/demo.md на 5 минут: 5 шагов показа с живой ссылки.
Финальный прогон всего DoD всех фаз + отчёт мне.
DoD: преподаватель сам открывает ссылку и репозиторий и за 10 минут понимает и запускает проек