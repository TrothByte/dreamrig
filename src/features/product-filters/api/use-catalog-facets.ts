import { useProducts } from '@/entities/product'

export interface CatalogFacets {
  brands: string[]
  priceMin: number
  priceMax: number
  total: number
}

export function useCatalogFacets(): CatalogFacets {
  const { data } = useProducts({ page: 1, pageSize: 200, sort: 'popular' })
  const items = data?.items ?? []
  const brands = [...new Set(items.map((product) => product.brand))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const prices = items.map((product) => product.price)

  return {
    brands,
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: prices.length > 0 ? Math.max(...prices) : 100_000,
    total: data?.total ?? 0,
  }
}
