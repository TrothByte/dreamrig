import { getSupabaseEnv } from '../../config/env'
import {
  type OrderPayload,
  orderPayloadSchema,
  type Product,
  productSchema,
  type Review,
} from '../../model/product'
import type { ProductPage, ProductQueryParams, ProductRepository } from '../product-repo'
import { getSupabaseClient } from './client'

const PRODUCT_COLUMNS =
  'id, slug, name, brand, category, price, market_price, specs, in_stock, rating, reviews_count, description, created_at'

function toIsoString(value: unknown): string {
  return new Date(value instanceof Date ? value.getTime() : String(value)).toISOString()
}

function parseProductRow(row: unknown): Product {
  const record = row as Record<string, unknown>
  return productSchema.parse({
    id: record.id,
    slug: record.slug,
    name: record.name,
    brand: record.brand,
    category: record.category,
    price: record.price,
    marketPrice: record.market_price,
    specs: record.specs,
    inStock: record.in_stock,
    rating: Number(record.rating),
    reviewsCount: record.reviews_count,
    description: record.description,
    createdAt: toIsoString(record.created_at),
  })
}

function toOrderSortColumn(sort: ProductQueryParams['sort']): string {
  switch (sort) {
    case 'price_asc':
    case 'price_desc':
      return 'price'
    case 'newest':
      return 'created_at'
    default:
      return 'rating'
  }
}

export class SupabaseProductRepository implements ProductRepository {
  async getProducts(params: ProductQueryParams = {}): Promise<ProductPage> {
    const client = getSupabaseClient()
    const { category, brands, priceMin, priceMax, inStockOnly, search, sort } = params
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 24

    let query = client.from('products').select(PRODUCT_COLUMNS, { count: 'exact' })

    if (category !== undefined) {
      query = query.eq('category', category)
    }
    if (brands !== undefined && brands.length > 0) {
      query = query.in('brand', brands)
    }
    if (priceMin !== undefined) {
      query = query.gte('price', priceMin)
    }
    if (priceMax !== undefined) {
      query = query.lte('price', priceMax)
    }
    if (inStockOnly === true) {
      query = query.gt('in_stock', 0)
    }
    if (search !== undefined && search.trim() !== '') {
      const needle = search.trim()
      query = query.or(`name.ilike.%${needle}%,brand.ilike.%${needle}%`)
    }

    const primaryColumn = toOrderSortColumn(sort)
    query = query.order(primaryColumn, { ascending: sort === 'price_asc' })
    if (primaryColumn === 'rating') {
      query = query.order('reviews_count', { ascending: false })
    }

    const start = (page - 1) * pageSize
    const { data, error, count } = await query.range(start, start + pageSize - 1)

    if (error !== null) {
      throw new Error(`Не удалось загрузить товары: ${error.message}`)
    }

    const items = (data ?? []).map(parseProductRow)
    return { items, total: count ?? items.length, page, pageSize }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('slug', slug)
      .maybeSingle()

    if (error !== null) {
      throw new Error(`Не удалось загрузить товар: ${error.message}`)
    }

    return data === null ? null : parseProductRow(data)
  }

  async getReviews(_slug: string): Promise<Review[]> {
    return []
  }

  async getSimilar(slug: string, limit = 4): Promise<Product[]> {
    const client = getSupabaseClient()
    const current = await this.getProductBySlug(slug)
    if (current === null) {
      return []
    }

    const { data, error } = await client
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('category', current.category)
      .neq('slug', slug)
      .order('rating', { ascending: false })
      .order('reviews_count', { ascending: false })
      .limit(limit)

    if (error !== null) {
      throw new Error(`Не удалось загрузить похожие товары: ${error.message}`)
    }

    return (data ?? []).map(parseProductRow)
  }

  async createOrder(payload: OrderPayload): Promise<{ id: string }> {
    const { url, anonKey } = getSupabaseEnv()
    if (url === '' || anonKey === '') {
      throw new Error(
        'Для VITE_API_MODE=supabase заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env',
      )
    }

    const parsed = orderPayloadSchema.parse(payload)
    const response = await fetch(`${url}/rest/v1/rpc/create_order`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_customer: parsed.customer,
        p_delivery: parsed.delivery,
        p_items: parsed.items.map((item) => ({
          product_id: item.productId,
          qty: item.qty,
        })),
      }),
    })

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      throw new Error(`Не удалось создать заказ: ${errorBody?.message ?? response.status}`)
    }

    const orderId = (await response.json()) as unknown
    if (typeof orderId !== 'number' && typeof orderId !== 'string') {
      throw new Error('Не удалось создать заказ: пустой ответ')
    }

    return { id: String(orderId) }
  }
}
