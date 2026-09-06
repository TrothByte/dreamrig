import { useEffect, useMemo, useState } from 'react'
import { useCatalogFacets, useCatalogParams } from '@/features/product-filters'
import { cn, formatPrice } from '@/shared/lib'
import { Button, PriceRangeSlider } from '@/shared/ui'

function FiltersSectionTitle({ children }: { children: string }) {
  return <h2 className="text-12 font-medium uppercase tracking-widest text-muted">{children}</h2>
}

export function FiltersPanel({ className }: { className?: string }) {
  const { params, hasActiveFilters, updateParams, resetFilters } = useCatalogParams()
  const facets = useCatalogFacets()
  const boundsReady = facets.brands.length > 0
  const rangeMin = params.priceMin ?? facets.priceMin
  const rangeMax = params.priceMax ?? facets.priceMax

  const [priceDraft, setPriceDraft] = useState<[number, number]>([rangeMin, rangeMax])

  useEffect(() => {
    setPriceDraft([rangeMin, rangeMax])
  }, [rangeMin, rangeMax])

  const handlePriceCommit = (value: [number, number]) => {
    updateParams({
      priceMin: value[0] <= facets.priceMin ? undefined : value[0],
      priceMax: value[1] >= facets.priceMax ? undefined : value[1],
    })
  }

  const toggleBrand = (brand: string) => {
    const brands = params.brands.includes(brand)
      ? params.brands.filter((item) => item !== brand)
      : [...params.brands, brand]
    updateParams({ brands })
  }

  const skeletonRows = useMemo(() => ['a', 'b', 'c', 'd'], [])

  return (
    <aside className={cn('flex flex-col gap-7', className)} aria-label="Фильтры каталога">
      <section className="flex flex-col gap-3">
        <FiltersSectionTitle>Цена</FiltersSectionTitle>
        <PriceRangeSlider
          min={facets.priceMin}
          max={facets.priceMax}
          value={priceDraft}
          onChange={setPriceDraft}
          onCommit={handlePriceCommit}
        />
        <div className="flex items-center justify-between font-mono text-12 tabular-nums text-muted">
          <span>{formatPrice(priceDraft[0])}</span>
          <span>{formatPrice(priceDraft[1])}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <FiltersSectionTitle>Бренды</FiltersSectionTitle>
        {boundsReady ? (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto scrollbar-thin pr-1">
            {facets.brands.map((brand) => {
              const checked = params.brands.includes(brand)
              return (
                <label
                  key={brand}
                  className="flex cursor-pointer items-center gap-3 rounded-btn px-2 py-1.5 text-14 hover:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    className="size-4 shrink-0 rounded accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <span className={cn(checked ? 'text-foreground' : 'text-muted')}>{brand}</span>
                </label>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {skeletonRows.map((row) => (
              <div key={row} className="skeleton h-4 w-full rounded-full" />
            ))}
          </div>
        )}
      </section>

      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-14 font-medium">Только в наличии</span>
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
          className="relative h-6 w-11 shrink-0 rounded-full bg-surface-2 transition-colors duration-200 peer-checked:bg-accent after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-background after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
        />
      </label>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="justify-start text-muted hover:text-foreground"
        >
          Сбросить фильтры
        </Button>
      )}
    </aside>
  )
}
