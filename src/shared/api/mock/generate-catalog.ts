import { fakerRU } from '@faker-js/faker'
import { type Product, productSchema, type Review, reviewSchema } from '../../model/product'
import { BASE_PRODUCTS, type BaseProductSeed, type ProductSeedOption } from './base-products'
import { EXTRA_PRODUCTS } from './extra-products'

const GENERATION_SEED = 20260906

fakerRU.seed(GENERATION_SEED)

const reviewTextsByRating: Record<number, string[]> = {
  3: [
    'В целом нормально, но ожидал чуть большего за эти деньги.',
    'Работает стабильно, хотя на максимальной нагрузке шумновато.',
    'Неплохо, но упаковка пришла помятой. Сам товар целый.',
  ],
  4: [
    'Хорошая вещь, полностью устраивает. Мелких минусов не вижу.',
    'Работает отлично, единственное — хотелось бы комплект побогаче.',
    'Доволен покупкой, всё соответствует описанию.',
  ],
  5: [
    'Взял в новую сборку, работает идеально. Очень доволен.',
    'Лучшее соотношение цены и качества на рынке. Рекомендую.',
    'Качественная сборка, в системе определяется без проблем.',
    'Спустя два месяца активного использования претензий нет.',
    'Быстрая доставка, отличная упаковка, товар как в описании.',
    'Не пожалел ни разу — берёт любые нагрузки легко и тихо.',
  ],
}

interface CatalogSeedEntry {
  seed: BaseProductSeed
  option?: ProductSeedOption
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function makeSeedEntries(): CatalogSeedEntry[] {
  const entries: CatalogSeedEntry[] = []
  const allSeeds = [...BASE_PRODUCTS, ...EXTRA_PRODUCTS]
  for (const seed of allSeeds) {
    entries.push({ seed })
    for (const option of seed.siblings ?? []) {
      entries.push({ seed, option })
    }
  }
  return entries
}

function generateReviews(product: Product, index: number): Review[] {
  const reviewsCount = 3 + (index % 4)
  const createdAt = new Date(product.createdAt)

  return Array.from({ length: reviewsCount }, (_, reviewIndex) => {
    const rating = fakerRU.helpers.arrayElement([5, 5, 4, 5, 4, 5, 3])
    const author = `${fakerRU.person.firstName()} ${fakerRU.person.lastName()}`
    const text = fakerRU.helpers.arrayElement(reviewTextsByRating[rating])
    const date = new Date(createdAt)
    date.setDate(date.getDate() + 5 + reviewIndex * 13)

    return reviewSchema.parse({
      id: fakerRU.string.uuid(),
      productSlug: product.slug,
      author,
      rating,
      text,
      createdAt: date.toISOString(),
    })
  })
}

function toProduct(entry: CatalogSeedEntry): Product {
  const { seed, option } = entry
  const name = option?.name ?? seed.name
  const brand = option?.brand ?? seed.brand
  const price = option?.price ?? seed.price
  const marketPrice = option?.marketPrice ?? seed.marketPrice
  const inStock = option?.inStock ?? seed.inStock
  const specs = { ...seed.specs, ...(option?.specs ?? {}) }
  const description = option?.description ?? seed.description
  const createdDate = fakerRU.date.between({ from: '2023-01-01', to: '2025-06-01' })

  return {
    id: fakerRU.string.uuid(),
    slug: slugify(name),
    name,
    brand,
    category: seed.category,
    price,
    marketPrice,
    specs,
    inStock,
    rating: 0,
    reviewsCount: 0,
    description,
    createdAt: createdDate.toISOString(),
  }
}

function buildCatalog() {
  const entries = makeSeedEntries()
  const products: Product[] = []
  const reviews: Review[] = []
  const seenSlugs = new Set<string>()

  for (const [index, entry] of entries.entries()) {
    const product = productSchema.parse(toProduct(entry))
    const productReviews = generateReviews(product, index)
    const averageRating =
      productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length

    const fullProduct = productSchema.parse({
      ...product,
      rating: Math.round(averageRating * 10) / 10,
      reviewsCount: productReviews.length,
    })

    if (seenSlugs.has(fullProduct.slug)) {
      throw new Error(`Дублирующийся slug в каталоге: ${fullProduct.slug}`)
    }
    seenSlugs.add(fullProduct.slug)

    products.push(fullProduct)
    reviews.push(...productReviews)
  }

  const reviewsBySlug = new Map<string, Review[]>()
  for (const review of reviews) {
    const productReviews = reviewsBySlug.get(review.productSlug)
    if (productReviews === undefined) {
      reviewsBySlug.set(review.productSlug, [review])
    } else {
      productReviews.push(review)
    }
  }

  return { products, reviews, reviewsBySlug }
}

export const generateCatalog = buildCatalog
export const catalog = buildCatalog()
export const { products, reviews, reviewsBySlug } = catalog
