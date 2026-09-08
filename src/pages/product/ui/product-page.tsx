import { Heart, ShieldCheck, Star, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { selectIsFavorite, useFavoriteStore } from '@/entities/favorite'
import { useProduct, useReviews, useSimilar } from '@/entities/product'
import { useAddToCart } from '@/features/add-to-cart'
import {
  CATEGORY_LABELS,
  cn,
  discountPercent,
  formatPrice,
  resolveProductPhotoUrls,
  useDocumentMeta,
} from '@/shared/lib'
import type { Category, Product } from '@/shared/model'
import { Button, ProductVisual } from '@/shared/ui'
import { ProductGrid } from '@/widgets/product-grid'

const VISUAL_FILTERS = ['none', 'brightness(0.97) saturate(0.92)', 'contrast(1.06) saturate(1.04)']

function TintGallery({ category }: { category: Category }) {
  const [activeTint, setActiveTint] = useState(0)

  return (
    <div>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <div style={{ filter: VISUAL_FILTERS[activeTint] }}>
          <ProductVisual
            category={category}
            className="w-full"
            iconClassName="size-16 sm:size-24"
          />
        </div>
      </div>
      <fieldset className="mt-3 flex gap-2">
        <legend className="sr-only">Варианты оттенка товара</legend>
        {VISUAL_FILTERS.map((filter, index) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeTint === index}
            aria-label={`Оттенок ${index + 1}`}
            onClick={() => setActiveTint(index)}
            className={cn(
              'size-16 overflow-hidden rounded-[10px] border transition-colors duration-200',
              activeTint === index ? 'border-accent' : 'border-border hover:border-border-strong',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <div style={{ filter }}>
              <ProductVisual category={category} iconClassName="size-6" />
            </div>
          </button>
        ))}
      </fieldset>
    </div>
  )
}

function useAvailableImages(urls: string[]): string[] {
  const [available, setAvailable] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const found: string[] = []

    const probe = (index: number) => {
      if (index >= urls.length || cancelled) {
        if (!cancelled) {
          setAvailable(found)
        }
        return
      }
      const image = new Image()
      image.onload = () => {
        found.push(urls[index])
        probe(index + 1)
      }
      image.onerror = () => probe(index + 1)
      image.src = urls[index]
    }

    setAvailable([])
    probe(0)
    return () => {
      cancelled = true
    }
  }, [urls])

  return available
}

function PhotoGallery({
  category,
  urls,
  alt,
}: {
  category: Category
  urls: string[]
  alt: string
}) {
  const available = useAvailableImages(urls)
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = Math.min(activeIndex, Math.max(available.length - 1, 0))
  const currentUrl = available[safeIndex]

  return (
    <div>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {currentUrl === undefined ? (
          <ProductVisual category={category} className="w-full" />
        ) : (
          <img src={currentUrl} alt={alt} className="aspect-[4/3] h-auto w-full object-cover" />
        )}
      </div>
      {available.length > 1 && (
        <div className="mt-3 flex gap-2">
          {available.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-pressed={safeIndex === index}
              aria-label={`Фото ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'size-16 overflow-hidden rounded-[10px] border transition-colors duration-200 sm:size-20',
                safeIndex === index ? 'border-accent' : 'border-border hover:border-border-strong',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <img src={url} alt="" className="aspect-[4/3] h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductGallery({
  slug,
  category,
  alt,
}: {
  slug: string
  category: Category
  alt?: string
}) {
  const photoUrls = useMemo(() => resolveProductPhotoUrls(slug), [slug])
  if (photoUrls.length === 0) {
    return <TintGallery category={category} />
  }
  return <PhotoGallery category={category} urls={photoUrls} alt={alt ?? slug} />
}

function ProductSkeleton() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 xl:grid-cols-[1.05fr_1fr] lg:gap-12">
      <div className="skeleton aspect-[4/3] rounded-card" aria-hidden="true" />
      <div className="flex flex-col gap-4">
        <div className="skeleton h-5 w-24 rounded-full" aria-hidden="true" />
        <div className="skeleton h-9 w-3/4 rounded-md" aria-hidden="true" />
        <div className="skeleton h-4 w-40 rounded-md" aria-hidden="true" />
        <div className="skeleton mt-2 h-12 w-52 rounded-md" aria-hidden="true" />
        <div className="skeleton mt-2 h-24 w-full rounded-md" aria-hidden="true" />
        <div className="skeleton mt-2 h-12 w-full rounded-btn" aria-hidden="true" />
      </div>
    </div>
  )
}

function SpecsTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs)
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <table className="w-full text-14">
        <caption className="sr-only">Характеристики товара</caption>
        <tbody>
          {entries.map(([label, value], index) => (
            <tr key={label} className={cn(index % 2 === 0 && 'bg-surface-2/50')}>
              <th scope="row" className="w-1/2 px-5 py-3 text-left font-normal text-muted">
                {label}
              </th>
              <td className="px-5 py-3 text-foreground">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReviewStars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`Оценка ${value} из 5`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn(
            'size-4',
            star <= Math.round(value) ? 'fill-current text-warn' : 'fill-transparent text-muted',
          )}
        />
      ))}
    </span>
  )
}

function getInitials(author: string): string {
  const parts = author.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

const REVIEW_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function ReviewsSection({ slug }: { slug: string }) {
  const { data: reviews, isPending } = useReviews(slug)
  const list = reviews ?? []
  const average =
    list.length > 0 ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : 0
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: list.filter((review) => review.rating === stars).length,
  }))

  return (
    <section aria-labelledby="reviews-title" className="mt-16">
      <h2 id="reviews-title" className="text-24 font-semibold tracking-tight sm:text-32">
        Отзывы
      </h2>

      {isPending ? (
        <div className="mt-6 flex flex-col gap-4" aria-hidden="true">
          {['a', 'b', 'c'].map((key) => (
            <div key={key} className="skeleton h-28 w-full rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-6 text-14 text-muted">Отзывов пока нет — станьте первым.</p>
      ) : (
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="font-mono text-40 font-semibold tabular-nums">{average.toFixed(1)}</p>
            <ReviewStars value={average} />
            <p className="mt-2 text-12 text-muted">На основе {list.length} отзывов</p>

            <dl className="mt-5 flex flex-col gap-2">
              {distribution.map(({ stars, count }) => {
                const percent = list.length === 0 ? 0 : Math.round((count / list.length) * 100)
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <dt className="w-3 font-mono text-12 tabular-nums text-muted">{stars}</dt>
                    <dd className="flex flex-1 items-center gap-3">
                      <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <span
                          className="block h-full rounded-full bg-warn"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="w-8 text-right font-mono text-12 tabular-nums text-muted">
                        {count}
                      </span>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="flex flex-col gap-4">
            {list.map((review) => (
              <article key={review.id} className="rounded-card border border-border bg-surface p-5">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-14 font-semibold text-foreground"
                  >
                    {getInitials(review.author)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-14 font-medium">{review.author}</p>
                    <time className="text-12 text-muted">
                      {REVIEW_DATE_FORMATTER.format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <ReviewStars value={review.rating} />
                </div>
                <p className="mt-3 text-14 leading-relaxed text-foreground">{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function SimilarSection({ product }: { product: Product }) {
  const { data: similar, isPending } = useSimilar(product.slug, 4)
  const items = similar ?? []

  return (
    <section aria-labelledby="similar-title" className="mt-16">
      <h2 id="similar-title" className="text-24 font-semibold tracking-tight sm:text-32">
        Похожие товары
      </h2>
      <div className="mt-6">
        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {['a', 'b', 'c', 'd'].map((key) => (
              <div key={key} className="skeleton aspect-[3/4] rounded-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-14 text-muted">
            Похожих товаров пока нет.{' '}
            <Link to="/catalog" className="text-accent hover:underline focus-visible:outline-none">
              Перейти в каталог
            </Link>
          </p>
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </section>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, isPending, isError } = useProduct(slug)
  const addToCart = useAddToCart()
  const isFavorite = useFavoriteStore(selectIsFavorite(product?.id ?? ''))
  const toggleFavorite = useFavoriteStore((state) => state.toggle)

  useDocumentMeta(
    product == null ? undefined : `${product.name} — купить в DreamRig`,
    product?.description.slice(0, 160),
  )

  if (isPending) {
    return (
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-7xl">
          <ProductSkeleton />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-24 font-semibold tracking-tight">Не удалось загрузить товар</h1>
        <Button asChild>
          <Link to="/catalog">Вернуться в каталог</Link>
        </Button>
      </section>
    )
  }

  if (product === null) {
    return <Navigate to="/404" replace />
  }

  const discount = discountPercent(product.price, product.marketPrice)
  const savings = product.marketPrice - product.price
  const unavailable = product.inStock <= 0

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <nav aria-label="Хлебные крошки" className="text-12 text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground focus-visible:outline-none">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/catalog" className="hover:text-foreground focus-visible:outline-none">
                Каталог
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={`/catalog?category=${product.category}`}
                className="hover:text-foreground focus-visible:outline-none"
              >
                {CATEGORY_LABELS[product.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-60 truncate text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[1.05fr_1fr]">
          <ProductGallery slug={product.slug} category={product.category} alt={product.name} />

          <div className="flex flex-col gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-12 font-medium text-muted">
                  {product.brand}
                </span>
                <span className="flex items-center gap-1.5 text-warn">
                  <Star aria-hidden="true" strokeWidth={1.75} className="size-4 fill-current" />
                  <span className="font-mono text-14 tabular-nums">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="font-mono text-12 tabular-nums text-muted">
                    · {product.reviewsCount} отзывов
                  </span>
                </span>
              </div>
              <h1 className="mt-3 text-32 font-semibold leading-tight tracking-tight sm:text-40">
                {product.name}
              </h1>
            </div>

            <p className={cn('flex items-center gap-2 text-14')}>
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', unavailable ? 'bg-muted' : 'bg-success')}
              />
              {unavailable ? (
                <span className="text-muted">Под заказ — уточните сроки</span>
              ) : (
                <span className="text-foreground">
                  В наличии: <span className="font-mono tabular-nums">{product.inStock}</span> шт
                </span>
              )}
            </p>

            <div className="rounded-card border border-border bg-surface p-6">
              <p className="font-mono text-40 font-semibold leading-none tabular-nums">
                {formatPrice(product.price)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-16 tabular-nums text-muted line-through">
                  {formatPrice(product.marketPrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-12 tabular-nums font-medium text-accent">
                      −{discount}%
                    </span>
                    <span className="font-mono text-14 tabular-nums text-success">
                      Выгода {formatPrice(savings)}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  disabled={unavailable}
                  onClick={() => addToCart(product)}
                  className="sm:flex-1"
                >
                  {unavailable ? 'Нет в наличии' : 'В корзину'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                  onClick={() => toggleFavorite(product.id)}
                  className="border border-border"
                >
                  <Heart
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className={cn('size-5', isFavorite && 'fill-current text-accent')}
                  />
                </Button>
              </div>
            </div>

            <ul className="flex flex-col gap-2 text-12 text-muted sm:flex-row sm:gap-6">
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />
                Гарантия 24 мес
              </li>
              <li className="flex items-center gap-2">
                <Truck aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />
                Доставка 1–3 дня
              </li>
            </ul>

            <p className="text-16 leading-relaxed text-muted">{product.description}</p>
          </div>
        </div>

        <section aria-labelledby="specs-title" className="mt-16">
          <h2 id="specs-title" className="text-24 font-semibold tracking-tight sm:text-32">
            Характеристики
          </h2>
          <div className="mt-6 max-w-3xl">
            <SpecsTable specs={product.specs} />
          </div>
        </section>

        <ReviewsSection slug={product.slug} />
        <SimilarSection product={product} />
      </div>
    </section>
  )
}
