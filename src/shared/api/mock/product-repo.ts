import type { OrderPayload, Product, Review } from '../../model/product'
import type { ProductPage, ProductQueryParams, ProductRepository } from '../product-repo'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)

  if (!response.ok) {
    throw new Error(`Ошибка запроса ${path}: ${response.status}`)
  }

  return (await response.json()) as T
}

function toSearchParams(params: ProductQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (params.category !== undefined) {
    searchParams.set('category', params.category)
  }
  for (const brand of params.brands ?? []) {
    searchParams.append('brands', brand)
  }
  if (params.priceMin !== undefined) {
    searchParams.set('priceMin', String(params.priceMin))
  }
  if (params.priceMax !== undefined) {
    searchParams.set('priceMax', String(params.priceMax))
  }
  if (params.inStockOnly === true) {
    searchParams.set('inStock', '1')
  }
  if (params.search !== undefined && params.search.length > 0) {
    searchParams.set('search', params.search)
  }
  searchParams.set('sort', params.sort ?? 'popular')
  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 24))

  return searchParams
}

export class MswProductRepository implements ProductRepository {
  async getProducts(params: ProductQueryParams = {}): Promise<ProductPage> {
    const query = toSearchParams(params).toString()
    return requestJson<ProductPage>(`/api/products?${query}`)
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return requestJson<Product | null>(`/api/products/${encodeURIComponent(slug)}`)
  }

  async getReviews(slug: string): Promise<Review[]> {
    return requestJson<Review[]>(`/api/products/${encodeURIComponent(slug)}/reviews`)
  }

  async getSimilar(slug: string, limit = 4): Promise<Product[]> {
    return requestJson<Product[]>(
      `/api/products/${encodeURIComponent(slug)}/similar?limit=${limit}`,
    )
  }

  async createOrder(payload: OrderPayload): Promise<{ id: string }> {
    return requestJson<{ id: string }>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}
