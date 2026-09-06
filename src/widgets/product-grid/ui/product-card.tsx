import { Star } from 'lucide-react'
import { Link } from 'react-router'
import { cn, discountPercent, formatPrice } from '@/shared/lib'
import type { Product } from '@/shared/model'
import { ProductVisual } from '@/shared/ui'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = discountPercent(product.price, product.marketPrice)

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-transform duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99]',
        className,
      )}
    >
      <div className="p-3 pb-0">
        <ProductVisual category={product.category} className="w-full rounded-[10px]" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-12 font-medium text-muted">
            {product.brand}
          </span>
          <span className="ml-auto flex items-center gap-1 text-warn">
            <Star className="size-4 fill-current" strokeWidth={1.75} />
            <span className="font-mono text-12 tabular-nums">{product.rating.toFixed(1)}</span>
          </span>
        </div>

        <p className="line-clamp-2 text-14 font-medium leading-snug">{product.name}</p>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          <span className="font-mono text-20 font-semibold tabular-nums">
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
}
