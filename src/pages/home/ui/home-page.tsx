import { ArrowRight, BadgePercent, ShieldCheck, Truck } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useProducts } from '@/entities/product'
import { CATEGORY_LABELS, CATEGORY_ORDER, discountPercent } from '@/shared/lib'
import { Button, CATEGORY_ICONS } from '@/shared/ui'
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
      <section className="px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <h1 className="text-32 font-semibold leading-tight tracking-tight sm:text-40">
            Компьютерное железо по цене ниже среднерыночной
          </h1>
          <p className="mt-5 max-w-2xl text-16 leading-relaxed text-muted sm:text-20">
            Видеокарты, процессоры, память и периферия. У каждого товара своя цена и честная скидка
            относительно рынка — без распродаж-фикций.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/catalog">
              Перейти в каталог
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </Link>
          </Button>

          <dl className="mt-12 flex items-center justify-center gap-10 sm:gap-16">
            <div className="flex flex-col items-center gap-1">
              <dt className="text-12 uppercase tracking-widest text-muted">Товаров</dt>
              <dd className="font-mono text-24 font-semibold tabular-nums sm:text-32">
                {isPending ? '—' : `${metrics.total}+`}
              </dd>
            </div>
            <div className="flex flex-col items-center gap-1">
              <dt className="text-12 uppercase tracking-widest text-muted">К рынку в среднем</dt>
              <dd className="font-mono text-24 font-semibold tabular-nums sm:text-32">
                {isPending ? '—' : `−${metrics.averageDiscount}%`}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-24" aria-labelledby="categories-title">
        <div className="mx-auto w-full max-w-7xl">
          <h2 id="categories-title" className="text-24 font-semibold tracking-tight sm:text-32">
            Каталог по категориям
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_ORDER.map((category) => {
              const Icon = CATEGORY_ICONS[category]
              return (
                <Link
                  key={category}
                  to={`/catalog?category=${category}`}
                  className="group flex items-center gap-4 rounded-card border border-border bg-surface p-5 transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99]"
                >
                  <span className="rounded-[10px] bg-accent-soft p-3">
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.75}
                      className="size-5 text-accent transition-transform duration-200 ease-out group-hover:scale-110"
                    />
                  </span>
                  <span className="text-16 font-medium">{CATEGORY_LABELS[category]}</span>
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
