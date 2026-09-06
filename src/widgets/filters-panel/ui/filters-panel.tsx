import { RotateCcw, Search, X } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { useCatalogFacets, useCatalogParams } from '@/features/product-filters'
import { cn } from '@/shared/lib'
import { Button, PriceRangeSlider } from '@/shared/ui'

interface FiltersSectionProps {
  title: string
  children: ReactNode
}

function FiltersSection({ title, children }: FiltersSectionProps) {
  return (
    <fieldset className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="text-12 font-medium uppercase tracking-widest text-muted">{title}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

function parsePrice(value: string): number | undefined {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(parsed)) {
    return undefined
  }
  return Math.round(parsed)
}

export function FiltersPanel({ className }: { className?: string }) {
  const { params, hasActiveFilters, updateParams, resetFilters } = useCatalogParams()
  const facets = useCatalogFacets()
  const boundsReady = facets.brands.length > 0
  const min = facets.priceMin
  const max = facets.priceMax

  const [range, setRange] = useState<[number, number]>([
    params.priceMin ?? min,
    params.priceMax ?? max,
  ])
  const [fromText, setFromText] = useState(String(params.priceMin ?? min))
  const [toText, setToText] = useState(String(params.priceMax ?? max))
  const [brandQuery, setBrandQuery] = useState('')

  useEffect(() => {
    setRange([params.priceMin ?? min, params.priceMax ?? max])
  }, [min, max, params.priceMax, params.priceMin])

  useEffect(() => {
    setFromText(String(range[0]))
  }, [range[0]])

  useEffect(() => {
    setToText(String(range[1]))
  }, [range[1]])

  const commitPrice = (value: [number, number]) => {
    updateParams({
      priceMin: value[0] <= min ? undefined : value[0],
      priceMax: value[1] >= max ? undefined : value[1],
    })
  }

  const commitFrom = () => {
    const parsed = parsePrice(fromText)
    const lower = parsed === undefined ? min : Math.min(Math.max(parsed, min), range[1])
    setRange((current) => [lower, current[1]])
    setFromText(String(lower))
    commitPrice([lower, range[1]])
  }

  const commitTo = () => {
    const parsed = parsePrice(toText)
    const upper = parsed === undefined ? max : Math.max(Math.min(parsed, max), range[0])
    setRange((current) => [current[0], upper])
    setToText(String(upper))
    commitPrice([range[0], upper])
  }

  const handlePriceKeyDown = (event: KeyboardEvent<HTMLInputElement>, field: 'from' | 'to') => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
      if (field === 'from') {
        commitFrom()
      } else {
        commitTo()
      }
    }
  }

  const toggleBrand = (brand: string) => {
    const brands = params.brands.includes(brand)
      ? params.brands.filter((item) => item !== brand)
      : [...params.brands, brand]
    updateParams({ brands })
  }

  const normalizedQuery = brandQuery.trim().toLowerCase()
  const visibleBrands = useMemo(() => {
    if (normalizedQuery === '') {
      return facets.brands
    }
    return facets.brands.filter((brand) => brand.toLowerCase().includes(normalizedQuery))
  }, [facets.brands, normalizedQuery])

  const skeletonRows = useMemo(() => ['a', 'b', 'c', 'd'], [])

  return (
    <aside className={cn('flex flex-col gap-5', className)} aria-label="Фильтры каталога">
      <FiltersSection title="Цена">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price-from" className="text-12 text-muted">
              От
            </label>
            <div className="relative">
              <input
                id="price-from"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={!boundsReady}
                value={fromText}
                onChange={(event) => setFromText(event.target.value)}
                onBlur={commitFrom}
                onKeyDown={(event) => handlePriceKeyDown(event, 'from')}
                className="no-spinner w-full rounded-btn border border-border bg-background px-3 py-2 pr-8 font-mono text-14 tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-12 text-muted">
                ₽
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price-to" className="text-12 text-muted">
              До
            </label>
            <div className="relative">
              <input
                id="price-to"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={!boundsReady}
                value={toText}
                onChange={(event) => setToText(event.target.value)}
                onBlur={commitTo}
                onKeyDown={(event) => handlePriceKeyDown(event, 'to')}
                className="no-spinner w-full rounded-btn border border-border bg-background px-3 py-2 pr-8 font-mono text-14 tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-12 text-muted">
                ₽
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <PriceRangeSlider
            min={min}
            max={max}
            value={range}
            onChange={setRange}
            onCommit={commitPrice}
          />
        </div>
      </FiltersSection>

      <FiltersSection title="Бренды">
        <div className="relative">
          <label htmlFor="brand-search" className="sr-only">
            Поиск по брендам
          </label>
          <Search
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <input
            id="brand-search"
            type="search"
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            placeholder="Найти бренд…"
            className="w-full rounded-btn border border-border bg-background py-2 pl-9 pr-8 text-14 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          {brandQuery !== '' && (
            <button
              type="button"
              aria-label="Очистить поиск брендов"
              onClick={() => setBrandQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </button>
          )}
        </div>

        {boundsReady ? (
          visibleBrands.length > 0 ? (
            <div className="mt-3 flex max-h-56 flex-col gap-0.5 overflow-y-auto scrollbar-thin pr-1">
              {visibleBrands.map((brand) => {
                const checked = params.brands.includes(brand)
                return (
                  <label
                    key={brand}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-btn px-2 py-2 text-14 transition-colors duration-150',
                      checked
                        ? 'bg-accent-soft text-foreground'
                        : 'text-muted hover:bg-surface-2 hover:text-foreground',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand)}
                      className="size-[18px] shrink-0 cursor-pointer rounded accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                    <span className="truncate">{brand}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-14 text-muted">Бренды не найдены</p>
          )
        ) : (
          <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
            {skeletonRows.map((row) => (
              <div key={row} className="skeleton h-4 w-full rounded-full" />
            ))}
          </div>
        )}
      </FiltersSection>

      <FiltersSection title="Наличие">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="text-14">Только в наличии</span>
          <input
            type="checkbox"
            role="switch"
            aria-checked={params.inStockOnly}
            checked={params.inStockOnly}
            onChange={() => updateParams({ inStockOnly: !params.inStockOnly })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
              'border-border bg-surface-hover',
              "after:absolute after:left-0.5 after:top-1/2 after:size-[18px] after:-translate-y-1/2 after:rounded-full after:bg-muted after:transition-all after:duration-200 after:content-['']",
              'peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:after:left-[calc(100%-1.25rem)] peer-checked:after:bg-accent',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            )}
          />
        </label>
      </FiltersSection>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="justify-center text-muted hover:text-foreground"
        >
          <RotateCcw aria-hidden="true" strokeWidth={1.75} className="size-4" />
          Сбросить фильтры
        </Button>
      )}
    </aside>
  )
}
