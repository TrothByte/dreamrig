import type { ProductQueryParams, ProductSort } from '@/shared/api/product-repo'
import { type Category, categorySchema } from '@/shared/model'

export const DEFAULT_SORT: ProductSort = 'popular'

const SORTS: ProductSort[] = ['popular', 'price_asc', 'price_desc', 'rating', 'newest']

export interface CatalogParams {
  category?: Category
  brands: string[]
  priceMin?: number
  priceMax?: number
  inStockOnly: boolean
  search?: string
  sort: ProductSort
  page: number
}

export const DEFAULT_CATALOG_PARAMS: CatalogParams = {
  brands: [],
  inStockOnly: false,
  sort: DEFAULT_SORT,
  page: 1,
}

function parsePositiveInt(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') {
    return undefined
  }
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    return undefined
  }
  return value
}

export function parseCatalogParams(searchParams: URLSearchParams): CatalogParams {
  const rawCategory = searchParams.get('category')
  const rawSort = searchParams.get('sort')
  const category = categorySchema.options.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : undefined
  const priceMin = parsePositiveInt(searchParams.get('priceMin'))
  const priceMax = parsePositiveInt(searchParams.get('priceMax'))
  const sort = SORTS.includes(rawSort as ProductSort) ? (rawSort as ProductSort) : DEFAULT_SORT

  return {
    category,
    brands: searchParams.getAll('brands'),
    priceMin,
    priceMax,
    inStockOnly: searchParams.get('inStock') === '1',
    search: searchParams.get('search')?.trim() || undefined,
    sort,
    page: Math.max(1, Number(searchParams.get('page') ?? 1) || 1),
  }
}

export function serializeCatalogParams(params: CatalogParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (params.category !== undefined) {
    searchParams.set('category', params.category)
  }
  for (const brand of params.brands) {
    searchParams.append('brands', brand)
  }
  if (params.priceMin !== undefined) {
    searchParams.set('priceMin', String(params.priceMin))
  }
  if (params.priceMax !== undefined) {
    searchParams.set('priceMax', String(params.priceMax))
  }
  if (params.inStockOnly) {
    searchParams.set('inStock', '1')
  }
  if (params.search !== undefined) {
    searchParams.set('search', params.search)
  }
  if (params.sort !== DEFAULT_SORT) {
    searchParams.set('sort', params.sort)
  }
  if (params.page > 1) {
    searchParams.set('page', String(params.page))
  }

  return searchParams
}

export function applyCatalogPatch(
  params: CatalogParams,
  patch: Partial<CatalogParams>,
  resetPage = true,
): CatalogParams {
  const next = { ...params, ...patch }
  if (resetPage) {
    next.page = 1
  }
  return next
}

export function isCatalogDefault(params: CatalogParams): boolean {
  return (
    params.category === undefined &&
    params.brands.length === 0 &&
    params.priceMin === undefined &&
    params.priceMax === undefined &&
    !params.inStockOnly &&
    params.search === undefined
  )
}

export function toProductQueryParams(params: CatalogParams): ProductQueryParams {
  return {
    category: params.category,
    brands: params.brands,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    inStockOnly: params.inStockOnly,
    search: params.search,
    sort: params.sort,
    page: params.page,
    pageSize: 24,
  }
}
