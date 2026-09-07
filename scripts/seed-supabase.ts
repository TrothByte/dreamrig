import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { BASE_ARTICLES } from '../src/shared/api/mock/base-articles'
import { products } from '../src/shared/api/mock/generate-catalog'

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }
  const content = readFileSync(envPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) {
      continue
    }
    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }
    const key = line.slice(0, separatorIndex).trim()
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (key !== '' && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

interface ProductRow {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  market_price: number
  specs: Record<string, string>
  in_stock: number
  rating: number
  reviews_count: number
  description: string
  created_at: string
}

async function main(): Promise<void> {
  loadEnvFile()

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (url === undefined || url === '') {
    throw new Error('Не задан SUPABASE_URL. Добавьте его в .env')
  }
  if (serviceRoleKey === undefined || serviceRoleKey === '') {
    throw new Error('Не задан SUPABASE_SERVICE_ROLE_KEY. Добавьте его в .env')
  }

  const supabase = createClient(url, serviceRoleKey)
  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    market_price: product.marketPrice,
    specs: product.specs,
    in_stock: product.inStock,
    rating: product.rating,
    reviews_count: product.reviewsCount,
    description: product.description,
    created_at: product.createdAt,
  }))

  const batchSize = 100
  let inserted = 0

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize)
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'slug' })
    if (error !== null) {
      throw new Error(`Ошибка вставки товаров: ${error.message}`)
    }
    inserted += batch.length
    console.log(`Вставлено ${inserted} из ${rows.length}`)
  }

  console.log(`Каталог загружен: ${inserted} товаров`)

  const articleRows = BASE_ARTICLES.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    rubric: article.rubric,
    cover_path: article.coverPath,
    author: article.author,
    author_role: article.authorRole,
    reading_minutes: article.readingMinutes,
    body: article.body,
    published_at: article.publishedAt,
  }))

  const { error: articlesError } = await supabase.from('articles').upsert(articleRows, {
    onConflict: 'slug',
  })
  if (articlesError !== null) {
    throw new Error(`Ошибка вставки статей: ${articlesError.message}`)
  }

  console.log(`Статьи загружены: ${articleRows.length}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
