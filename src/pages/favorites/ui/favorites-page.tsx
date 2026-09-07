import { Heart, PackageSearch } from 'lucide-react'
import { Link } from 'react-router'
import { useFavoriteStore } from '@/entities/favorite'
import { useProductsByIds } from '@/entities/product'
import { useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { ProductGrid } from '@/widgets/product-grid'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function ProductGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {SKELETON_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="overflow-hidden rounded-card border border-border bg-surface"
        >
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

export function FavoritesPage() {
  const ids = useFavoriteStore((state) => state.ids)
  const { data, isPending, isError, refetch } = useProductsByIds(ids)
  const products = data ?? []

  useDocumentMeta(
    'Избранное | DreamRig',
    'Отложенные товары в вашем избранном. Цены и наличие обновляются автоматически.',
  )

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
            <li aria-current="page" className="text-foreground">
              Избранное
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-col gap-2">
          <h1 className="text-32 font-semibold leading-tight tracking-tight sm:text-40">
            Избранное
          </h1>
          <p className="text-14 text-muted">
            {ids.length === 0 ? (
              'Здесь появятся товары, которые вы отметите сердечком.'
            ) : (
              <>
                Сохранено:{' '}
                <span className="font-mono tabular-nums text-foreground">
                  {isPending ? '…' : products.length}
                </span>{' '}
                из {ids.length}
              </>
            )}
          </p>
        </div>

        <div className="mt-8">
          {ids.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <Heart aria-hidden="true" strokeWidth={1.5} className="size-12 text-muted" />
              <h2 className="text-20 font-semibold tracking-tight">Пока ничего не сохранено</h2>
              <p className="max-w-md text-14 text-muted">
                Нажимайте на сердечко в карточках товаров, чтобы собрать список желаемого.
              </p>
              <Button asChild>
                <Link to="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : isPending ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <PackageSearch aria-hidden="true" strokeWidth={1.75} className="size-12 text-muted" />
              <h2 className="text-20 font-semibold tracking-tight">
                Не удалось загрузить избранное
              </h2>
              <p className="max-w-md text-14 text-muted">
                Проверьте соединение и попробуйте ещё раз.
              </p>
              <Button onClick={() => void refetch()}>Повторить</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <h2 className="text-20 font-semibold tracking-tight">
                Таких товаров больше нет в продаже
              </h2>
              <p className="max-w-md text-14 text-muted">
                Некоторые сохранённые позиции были сняты с продажи и автоматически убраны из списка.
              </p>
              <Button asChild variant="secondary">
                <Link to="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </section>
  )
}
