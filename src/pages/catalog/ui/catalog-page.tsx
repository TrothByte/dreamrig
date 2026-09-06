import { Link } from 'react-router'
import { useProducts } from '@/entities/product'
import { discountPercent, formatPrice } from '@/shared/lib'
import { Button } from '@/shared/ui'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {SKELETON_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="overflow-hidden rounded-card border border-border bg-surface"
        >
          <div className="skeleton aspect-[4/3]" />
          <div className="flex flex-col gap-3 p-5">
            <div className="skeleton h-4 w-3/4 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton mt-2 h-6 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CatalogPage() {
  const { data, isPending, isError, refetch } = useProducts()

  if (isPending) {
    return (
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">Каталог</h1>
          <p className="skeleton mt-4 h-4 w-32 rounded-full" />
          <div className="mt-6">
            <CatalogSkeleton />
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-24 font-semibold tracking-tight">Не удалось загрузить каталог</h1>
        <p className="max-w-md text-14 text-muted">Проверьте соединение и попробуйте ещё раз.</p>
        <Button onClick={() => void refetch()}>Повторить</Button>
      </section>
    )
  }

  const total = data?.total ?? 0
  const items = data?.items ?? []

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">Каталог</h1>
          <p className="font-mono text-14 tabular-nums text-muted">Найдено {total} товаров</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <h2 className="text-20 font-semibold tracking-tight">Ничего не найдено</h2>
            <p className="text-14 text-muted">Попробуйте изменить параметры поиска.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => {
              const discount = discountPercent(product.price, product.marketPrice)
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group overflow-hidden rounded-card border border-border bg-surface transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99]"
                >
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-2">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-12 font-medium text-accent">
                      {product.brand}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 sm:p-5">
                    <p className="line-clamp-2 text-14 font-medium leading-snug">{product.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-20 font-semibold tabular-nums text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      <span className="font-mono text-12 tabular-nums text-muted line-through">
                        {formatPrice(product.marketPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {discount > 0 ? (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-12 tabular-nums font-medium text-accent">
                          −{discount}%
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-12 text-muted">
                        {product.inStock > 0 ? `В наличии: ${product.inStock} шт` : 'Под заказ'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
