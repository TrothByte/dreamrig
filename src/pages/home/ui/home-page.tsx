import { ArrowRight, BadgePercent, ShieldCheck, Truck } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useArticles } from '@/entities/article'
import { useProducts } from '@/entities/product'
import { CATEGORY_LABELS, CATEGORY_ORDER, discountPercent } from '@/shared/lib'
import { Button, CATEGORY_ICONS } from '@/shared/ui'
import { ArticleGrid, ArticleGridSkeleton } from '@/widgets/blog-grid'
import { ProductGrid } from '@/widgets/product-grid'

const HOT_KEYS = ['a', 'b', 'c', 'd']

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Гарантия 24 мес', text: 'Официальная гарантия на всё железо' },
  { icon: Truck, title: 'Доставка 1–3 дня', text: 'По городу — сегодня, по стране — быстро' },
  { icon: BadgePercent, title: 'Цены ниже рынка', text: 'Скидка у каждого товара, всегда' },
]

function HotPricesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {HOT_KEYS.map((key) => (
        <div key={key} className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="skeleton aspect-[4/3]" />
          <div className="flex flex-col gap-3 p-5">
            <div className="skeleton h-4 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton mt-2 h-6 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomePage() {
  const { data, isPending } = useProducts({ page: 1, pageSize: 200, sort: 'popular' })
  const items = data?.items ?? []
  const { data: blogData, isPending: blogPending } = useArticles({ page: 1, pageSize: 3 })
  const blogArticles = blogData?.items ?? []
  const showBlog = blogPending || blogArticles.length > 0

  const metrics = useMemo(() => {
    if (items.length === 0) {
      return { total: 0, averageDiscount: 0 }
    }
    const totalDiscount = items.reduce(
      (sum, product) => sum + discountPercent(product.price, product.marketPrice),
      0,
    )
    return {
      total: items.length,
      averageDiscount: Math.round(totalDiscount / items.length),
    }
  }, [items])

  const hotProducts = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) =>
            discountPercent(b.price, b.marketPrice) - discountPercent(a.price, a.marketPrice),
        )
        .slice(0, 8),
    [items],
  )

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pb-28 sm:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="hero-grid absolute inset-x-0 -top-24 h-[600px] opacity-70" />
          <div
            className="absolute left-1/2 top-[-360px] h-[620px] w-[min(960px,100%)] -translate-x-1/2 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(closest-side, var(--accent-soft), transparent 70%)',
            }}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 font-mono text-12 uppercase tracking-[0.18em] text-muted backdrop-blur-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Комплектующие и периферия
          </span>
          <h1 className="mt-7 text-balance text-40 font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3.5rem]">
            Компьютерное железо по цене ниже среднерыночной
          </h1>
          <p className="mt-6 max-w-2xl text-16 leading-relaxed text-muted sm:text-20">
            Видеокарты, процессоры, память и периферия. У каждого товара своя цена и честная скидка
            относительно рынка — без распродаж-фикций.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link to="/catalog">
              Перейти в каталог
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </Link>
          </Button>

          <dl className="mt-14 flex items-center divide-x divide-border overflow-hidden rounded-card border border-border bg-surface/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1.5 px-8 py-4 sm:px-12">
              <dd className="order-2 font-mono text-24 font-semibold tabular-nums sm:text-32">
                {isPending ? '—' : `${metrics.total}+`}
              </dd>
              <dt className="order-1 text-12 uppercase tracking-widest text-muted">Товаров</dt>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-8 py-4 sm:px-12">
              <dd className="order-2 font-mono text-24 font-semibold tabular-nums sm:text-32">
                {isPending ? '—' : `−${metrics.averageDiscount}%`}
              </dd>
              <dt className="order-1 text-12 uppercase tracking-widest text-muted">
                К рынку в среднем
              </dt>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-24" aria-labelledby="categories-title">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 id="categories-title" className="text-24 font-semibold tracking-tight sm:text-32">
              Каталог по категориям
            </h2>
            <Link
              to="/catalog"
              className="rounded-btn text-14 font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Весь каталог
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_ORDER.map((category) => {
              const Icon = CATEGORY_ICONS[category]
              return (
                <Link
                  key={category}
                  to={`/catalog?category=${category}`}
                  className="group flex items-center gap-4 rounded-card border border-border bg-surface p-5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card active:scale-[0.99]"
                >
                  <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border/80 bg-surface-2">
                    <span
                      aria-hidden="true"
                      className="product-visual-grid absolute inset-0 opacity-70"
                    />
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="relative size-5 text-foreground/75 transition-colors duration-200 group-hover:text-accent"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    <span className="text-16 font-medium">{CATEGORY_LABELS[category]}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors duration-200 group-hover:text-foreground">
                      Перейти
                      <ArrowRight
                        aria-hidden="true"
                        strokeWidth={1.75}
                        className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-24" aria-labelledby="hot-title">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 id="hot-title" className="text-24 font-semibold tracking-tight sm:text-32">
              Горящие цены
            </h2>
            <Link
              to="/catalog?sort=popular"
              className="text-14 font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-btn"
            >
              Весь каталог
            </Link>
          </div>
          <div className="mt-6">
            {isPending ? (
              <HotPricesSkeleton />
            ) : hotProducts.length === 0 ? (
              <p className="text-14 text-muted">Товары появятся совсем скоро.</p>
            ) : (
              <ProductGrid products={hotProducts} />
            )}
          </div>
        </div>
      </section>

      {showBlog && (
        <section className="px-4 pb-20 sm:px-6 sm:pb-24" aria-labelledby="blog-title">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <h2 id="blog-title" className="text-24 font-semibold tracking-tight sm:text-32">
                Блог о железе
              </h2>
              <Link
                to="/blog"
                className="rounded-btn text-14 font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Все статьи
              </Link>
            </div>
            <div className="mt-6">
              {blogPending ? (
                <ArticleGridSkeleton count={3} />
              ) : blogArticles.length > 0 ? (
                <ArticleGrid articles={blogArticles} className="sm:grid-cols-2 xl:grid-cols-3" />
              ) : null}
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-border bg-surface" aria-label="Наши гарантии">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 sm:py-12">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-start gap-4">
                <span className="rounded-[10px] bg-accent-soft p-3">
                  <Icon aria-hidden="true" strokeWidth={1.75} className="size-5 text-accent" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-16 font-medium">{item.title}</h3>
                  <p className="text-14 text-muted">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
