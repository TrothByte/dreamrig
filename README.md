# DreamRig

Интернет-магазин компьютерного железа и периферии. Товары продаются ниже среднерыночной цены: у каждой позиции своя цена и рыночная цена со скидкой.

[![CI](https://github.com/TrothByte/dreamrig/actions/workflows/ci.yml/badge.svg)](https://github.com/TrothByte/dreamrig/actions/workflows/ci.yml)

## Живой сайт

https://trothbyte.github.io/dreamrig/

## Стек

- React 19, TypeScript (strict), Vite
- Tailwind CSS v4, shadcn/ui
- TanStack Query v5, Zustand, react-router
- MSW + Supabase (два источника данных за единым zod-контрактом)
- Biome (lint + format), Vitest, Playwright

## Запуск

```bash
pnpm install
pnpm dev
```

Проверка перед коммитом:

```bash
pnpm check
pnpm test --run
pnpm build
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости переключите источник данных:

```
VITE_API_MODE=mock
```

`mock` — встроенные моки (MSW), `supabase` — живая база Postgres.

## Структура

Проект следует Feature-Sliced Design: `app → pages → widgets → features → entities → shared`. Подробности — в `docs/Agent.md`.
