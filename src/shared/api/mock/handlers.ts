import { delay, HttpResponse, http } from 'msw'
import { type Article, type ArticleRubric, articleRubricSchema } from '../../model/article'
import {
  type Category,
  categorySchema,
  type OrderPayload,
  orderPayloadSchema,
  type Product,
} from '../../model/product'
import type { ProductQueryParams, ProductSort } from '../product-repo'
import { BASE_ARTICLES } from './base-articles'
import { products, reviewsBySlug } from './generate-catalog'

const API_DELAY_MIN = 250
const API_DELAY_SPREAD = 150

const orderNumbers: number[] = []

async function randomDelay(): Promise<void> {
  await delay(API_DELAY_MIN + Math.floor(Math.random() * API_DELAY_SPREAD))
}

function sortArticlesByDate(items: Article[]): Article[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function getRelatedArticles(slug: string, limit: number): Article[] {
  const current = BASE_ARTICLES.find((article) => article.slug === slug)
  if (current === undefined) {
    return []
  }
  const sorted = sortArticlesByDate(BASE_ARTICLES)
  const sameRubric = sorted.filter(
    (article) => article.rubric === current.rubric && article.slug !== slug,
  )
  const others = sorted.filter(
    (article) => article.rubric !== current.rubric && article.slug !== slug,
  )
  return [...sameRubric, ...others].slice(0, limit)
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
    const rawIds = url.searchParams.getAll('ids')
    if (rawIds.length > 0) {
      const byId = new Map(products.map((product) => [product.id, product]))
      const items = rawIds
        .map((id) => byId.get(id))
        .filter((product): product is Product => product !== undefined)

      await randomDelay()

      return HttpResponse.json({ items, total: items.length, page: 1, pageSize: items.length })
    }

    const params = parseQueryParams(url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 24)))
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

  http.get('/api/articles', async ({ request }) => {
    const url = new URL(request.url)
    const rawRubric = url.searchParams.get('rubric')
    const rubric = articleRubricSchema.options.includes(rawRubric as ArticleRubric)
      ? (rawRubric as ArticleRubric)
      : undefined
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 9)))

    let filtered = sortArticlesByDate(BASE_ARTICLES)
    if (rubric !== undefined) {
      filtered = filtered.filter((article) => article.rubric === rubric)
    }
    const start = (page - 1) * pageSize

    await randomDelay()

    return HttpResponse.json({
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/articles/:slug/related', async ({ params, request }) => {
    const url = new URL(request.url)
    const limit = Math.min(6, Math.max(1, Number(url.searchParams.get('limit') ?? 3)))
    await randomDelay()
    return HttpResponse.json(getRelatedArticles(String(params.slug), limit))
  }),

  http.get('/api/articles/:slug', async ({ params }) => {
    await randomDelay()
    const article = BASE_ARTICLES.find((item) => item.slug === params.slug) ?? null
    return HttpResponse.json(article)
  }),
]
