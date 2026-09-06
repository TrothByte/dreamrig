import type { Category, OrderPayload, Product, Review } from '../model/product'

export type ProductSort = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'

export interface ProductQueryParams {
  category?: Category
  brands?: string[]
  priceMin?: number
  priceMax?: number
  inStockOnly?: boolean
  search?: string
  sort?: ProductSort
  page?: number
  pageSize?: number
}

export interface ProductPage {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

export interface ProductRepository {
  getProducts(params?: ProductQueryParams): Promise<ProductPage>
  getProductBySlug(slug: string): Promise<Product | null>
  getReviews(slug: string): Promise<Review[]>
  getSimilar(slug: string, limit?: number): Promise<Product[]>
  createOrder(payload: OrderPayload): Promise<{ id: string }>
}
