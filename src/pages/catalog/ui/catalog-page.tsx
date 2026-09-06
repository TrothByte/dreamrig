import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useProducts } from '@/entities/product'
import { toProductQueryParams, useCatalogParams } from '@/features/product-filters'
import type { ProductSort } from '@/shared/api/product-repo'
import { CATEGORY_LABELS } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { FiltersPanel } from '@/widgets/filters-panel'
import { ProductGrid } from '@/widgets/product-grid'

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Цена по возрастанию' },
  { value: 'price_desc', label: 'Цена по убыванию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'newest', label: 'Новинки' },
]

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function Breadcrumbs({ categoryLabel }: { categoryLabel?: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="text-12 text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className="hover:text-foreground focus-visible:outline-none">
            Главная
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to="/catalog" className="hover:text-foreground focus-visible:outline-none">
            Каталог
          </Link>
        </li>
        {categoryLabel !== undefined && (
          <>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {categoryLabel}
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}

function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {SKELETON_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="overflow-hidden rounded-card border border-border bg-surface"
        >
          <div className="skeleton aspect-[4/3]" />
          <div className="flex flex-col gap-3 p-5">
            <div className="skeleton h-4 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton mt-2 h-6 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function Pagination({
  current,
  pageCount,
  onPageChange,
}: {
  current: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  const items = useMemo(() => {
    type PageItem = { key: string; page?: number; ellipsis?: boolean }
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => ({
        key: `page-${index + 1}`,
        page: index + 1,
      })) as PageItem[]
    }
    const pages = new Set([1, pageCount, current - 1, current, current + 1])
    const sorted = [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)
    const result: PageItem[] = []
    for (const page of sorted) {
      const last = result[result.length - 1]
      if (typeof last?.page === 'number' && page - last.page > 1) {
        result.push({ key: `ellipsis-${last.page}`, ellipsis: true })
      }
      result.push({ key: `page-${page}`, page })
    }
    return result
  }, [current, pageCount])

  if (pageCount <= 1) {
    return null
  }

  return (
    <nav aria-label="Пагинация" className="mt-10 flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Предыдущая страница"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        <ChevronLeft />
      </Button>
      {items.map((item) =>
        item.ellipsis === true ? (
          <span key={item.key} className="px-1 font-mono text-14 text-muted">
            …
          </span>
        ) : (
          <Button
            key={item.key}
            type="button"
            variant={item.page === current ? 'default' : 'ghost'}
            size="sm"
            aria-current={item.page === current ? 'page' : undefined}
            onClick={() => onPageChange(item.page as number)}
            className="min-w-9 font-mono tabular-nums"
          >
            {item.page}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Следующая страница"
        disabled={current >= pageCount}
        onClick={() => onPageChange(current + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

export function CatalogPage() {
  const { params, hasActiveFilters, updateParams, resetFilters } = useCatalogParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data, isPending, isError, refetch } = useProducts(toProductQueryParams(params))
  const categoryLabel = params.category !== undefined ? CATEGORY_LABELS[params.category] : undefined
  const total = data?.total ?? 0
  const items = data?.items ?? []
  const pageSize = 24
  const pageCount = Math.ceil(total / pageSize)

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumbs categoryLabel={categoryLabel} />

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">
            {categoryLabel ?? 'Каталог'}
          </h1>
          <p className="font-mono text-14 tabular-nums text-muted">
            {isPending ? '…' : `Найдено ${total} товаров`}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-60 shrink-0 lg:block" aria-label="Фильтры">
            <div className="sticky top-24">
              <FiltersPanel />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-56">
                <label htmlFor="catalog-sort" className="sr-only">
                  Сортировка
                </label>
                <select
                  id="catalog-sort"
                  value={params.sort}
                  onChange={(event) => updateParams({ sort: event.target.value as ProductSort })}
                  className="w-full appearance-none rounded-btn border border-border bg-surface-2 px-3 py-2 pr-9 text-14 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -rotate-90 text-muted"
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal aria-hidden="true" strokeWidth={1.75} className="size-4" />
                Фильтры
              </Button>
            </div>

            <div className="mt-6">
              {isPending ? (
                <ProductGridSkeleton />
              ) : isError ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                  <h2 className="text-20 font-semibold tracking-tight">
                    Не удалось загрузить каталог
                  </h2>
                  <p className="max-w-md text-14 text-muted">
                    Проверьте соединение и попробуйте ещё раз.
                  </p>
                  <Button onClick={() => void refetch()}>Повторить</Button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                  <PackageSearch
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className="size-12 text-muted"
                  />
                  <h2 className="text-20 font-semibold tracking-tight">Ничего не найдено</h2>
                  <p className="max-w-md text-14 text-muted">
                    Попробуйте смягчить фильтры или сбросить их.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={hasActiveFilters ? resetFilters : () => updateParams({ page: 1 })}
                  >
                    {hasActiveFilters ? 'Сбросить фильтры' : 'К началу каталога'}
                  </Button>
                </div>
              ) : (
                <>
                  <ProductGrid products={items} className="lg:grid-cols-3 xl:grid-cols-4" />
                  <Pagination
                    current={params.page}
                    pageCount={pageCount}
                    onPageChange={(page) => updateParams({ page }, false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Фильтры каталога"
        >
          <button
            type="button"
            aria-label="Закрыть фильтры"
            className="absolute inset-0 bg-black/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-20 font-semibold tracking-tight">Фильтры</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Закрыть панель фильтров"
                onClick={() => setFiltersOpen(false)}
              >
                <X aria-hidden="true" strokeWidth={1.75} />
              </Button>
            </div>
            <FiltersPanel />
          </div>
        </div>
      )}
    </section>
  )
}
