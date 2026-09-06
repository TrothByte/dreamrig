import { delay, HttpResponse, http } from 'msw'
import {
  type Category,
  categorySchema,
  type OrderPayload,
  orderPayloadSchema,
  type Product,
} from '../../model/product'
import type { ProductQueryParams, ProductSort } from '../product-repo'
import { products, reviewsBySlug } from './generate-catalog'

const API_DELAY_MIN = 250
const API_DELAY_SPREAD = 150

const orderNumbers: number[] = []

async function randomDelay(): Promise<void> {
  await delay(API_DELAY_MIN + Math.floor(Math.random() * API_DELAY_SPREAD))
}

function sortProducts(items: Product[], sort: ProductSort): Product[] {
  const sorted = [...items]
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    default:
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
  }
}

function applyQueryParams(items: Product[], params: ProductQueryParams): Product[] {
  const { category, brands, priceMin, priceMax, inStockOnly, search } = params

  return items.filter((product) => {
    if (category !== undefined && product.category !== category) {
      return false
    }
    if (brands !== undefined && brands.length > 0 && !brands.includes(product.brand)) {
      return false
    }
    if (priceMin !== undefined && product.price < priceMin) {
      return false
    }
    if (priceMax !== undefined && product.price > priceMax) {
      return false
    }
    if (inStockOnly === true && product.inStock <= 0) {
      return false
    }
    if (search !== undefined && search.length > 0) {
      const needle = search.toLowerCase()
      const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase()
      if (!haystack.includes(needle)) {
        return false
      }
    }
    return true
  })
}

function parseQueryParams(url: URL): ProductQueryParams {
  const rawCategory = url.searchParams.get('category')
  const rawSort = url.searchParams.get('sort')
  const brands = url.searchParams.getAll('brands')

  const category = categorySchema.options.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : undefined

  const parseNumber = (key: string): number | undefined => {
    const value = url.searchParams.get(key)
    if (value === null || value.trim() === '') {
      return undefined
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return {
    category,
    brands: brands.length > 0 ? brands : undefined,
    priceMin: parseNumber('priceMin'),
    priceMax: parseNumber('priceMax'),
    inStockOnly: url.searchParams.get('inStock') === '1',
    search: url.searchParams.get('search') ?? undefined,
    sort: (rawSort as ProductSort | null) ?? 'popular',
  }
}

function getSimilarProducts(slug: string, limit: number): Product[] {
  const current = products.find((product) => product.slug === slug)
  if (current === undefined) {
    return []
  }
  return products
    .filter((product) => product.category === current.category && product.slug !== slug)
    .sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    .slice(0, limit)
}

export const handlers = [
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url)
    const params = parseQueryParams(url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(60, Math.max(1, Number(url.searchParams.get('pageSize') ?? 24)))
    const filtered = applyQueryParams(products, params)
    const sorted = sortProducts(filtered, params.sort ?? 'popular')
    const start = (page - 1) * pageSize

    await randomDelay()

    return HttpResponse.json({
      items: sorted.slice(start, start + pageSize),
      total: sorted.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/products/:slug/reviews', async ({ params }) => {
    await randomDelay()
    const slug = String(params.slug)
    return HttpResponse.json(reviewsBySlug.get(slug) ?? [])
  }),

  http.get('/api/products/:slug/similar', async ({ params, request }) => {
    const url = new URL(request.url)
    const limit = Math.min(8, Math.max(1, Number(url.searchParams.get('limit') ?? 4)))
    await randomDelay()
    return HttpResponse.json(getSimilarProducts(String(params.slug), limit))
  }),

  http.get('/api/products/:slug', async ({ params }) => {
    await randomDelay()
    const product = products.find((item) => item.slug === params.slug) ?? null
    return HttpResponse.json(product)
  }),

  http.post('/api/orders', async ({ request }) => {
    await randomDelay()
    const body = (await request.json()) as unknown
    const parsed = orderPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Некорректные данные заказа' }, { status: 400 })
    }
    const payload: OrderPayload = parsed.data
    const total = payload.items.reduce((sum, item) => sum + item.qty * item.priceAtPurchase, 0)
    const id = String(1000 + orderNumbers.length + 1)
    orderNumbers.push(orderNumbers.length + 1)
    return HttpResponse.json({ id, total }, { status: 201 })
  }),
]
