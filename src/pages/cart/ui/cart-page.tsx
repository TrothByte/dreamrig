import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { selectCartTotals, useCartStore } from '@/entities/cart'
import { formatPrice } from '@/shared/lib'
import { Button, ProductVisual, QtyStepper } from '@/shared/ui'

export function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const totals = useCartStore(useShallow(selectCartTotals))
  const setQty = useCartStore((state) => state.setQty)
  const removeLine = useCartStore((state) => state.removeLine)

  if (lines.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <ShoppingCart aria-hidden="true" strokeWidth={1.75} className="size-12 text-muted" />
        <h1 className="text-24 font-semibold tracking-tight">Корзина пуста</h1>
        <p className="max-w-md text-14 text-muted">
          Загляните в каталог — там сейчас есть отличные предложения.
        </p>
        <Button asChild>
          <Link to="/catalog">
            Перейти в каталог
            <ArrowRight aria-hidden="true" strokeWidth={1.75} />
          </Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-24 font-semibold tracking-tight sm:text-32">Корзина</h1>
        <p className="mt-1 text-14 text-muted">
          {totals.count}{' '}
          {totals.count === 1
            ? 'товар'
            : totals.count >= 2 && totals.count <= 4
              ? 'товара'
              : 'товаров'}
        </p>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
            {lines.map((line) => {
              const lineTotal = line.priceAtPurchase * line.qty
              return (
                <article
                  key={line.productId}
                  className="rounded-card border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                    <Link
                      to={`/product/${line.slug}`}
                      aria-label={line.name}
                      className="w-full shrink-0 self-center rounded-[10px] border border-border sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ProductVisual category={line.category} className="w-full rounded-[10px]" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${line.slug}`}
                        className="line-clamp-2 text-16 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-btn"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-12 text-muted">
                        {formatPrice(line.priceAtPurchase)} за шт ·{' '}
                        {line.inStock > 0 ? `в наличии ${line.inStock}` : 'под заказ'}
                      </p>
                      <p className="mt-2 font-mono text-20 font-semibold tabular-nums sm:hidden">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
                      <QtyStepper
                        value={line.qty}
                        max={line.inStock}
                        onChange={(qty) => setQty(line.productId, qty)}
                        ariaLabel={`Количество: ${line.name}`}
                      />
                      <p className="hidden font-mono text-20 font-semibold tabular-nums sm:block">
                        {formatPrice(lineTotal)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Удалить ${line.name} из корзины`}
                        onClick={() => removeLine(line.productId)}
                        className="text-muted hover:text-danger"
                      >
                        <Trash2 aria-hidden="true" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="lg:sticky lg:top-20">
            <div className="rounded-card border border-border bg-surface p-6">
              <h2 className="text-20 font-semibold tracking-tight">Итого</h2>
              <dl className="mt-4 flex flex-col gap-3 text-14">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Товары</dt>
                  <dd className="font-mono tabular-nums">{totals.count} шт</dd>
                </div>
                {totals.savings > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Ваша выгода</dt>
                    <dd className="font-mono tabular-nums text-success">
                      −{formatPrice(totals.savings)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-medium">Итого</dt>
                  <dd className="font-mono text-24 font-semibold tabular-nums">
                    {formatPrice(totals.total)}
                  </dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full">
                <Link to="/checkout">Оформить заказ</Link>
              </Button>
              <p className="mt-3 text-center text-12 text-muted">
                Оплата и доставка — после подтверждения по телефону
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
