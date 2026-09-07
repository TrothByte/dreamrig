import { Check, Heart, Plus, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { selectIsFavorite, useFavoriteStore } from '@/entities/favorite'
import { useAddToCart } from '@/features/add-to-cart'
import { cn, discountPercent, formatPrice } from '@/shared/lib'
import type { Product } from '@/shared/model'
import { Button, ProductVisual } from '@/shared/ui'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = discountPercent(product.price, product.marketPrice)
  const addToCart = useAddToCart()
  const isFavorite = useFavoriteStore(selectIsFavorite(product.id))
  const toggleFavorite = useFavoriteStore((state) => state.toggle)
  const [justAdded, setJustAdded] = useState(false)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (addedTimerRef.current !== null) {
        clearTimeout(addedTimerRef.current)
      }
    }
  }, [])

  const handleAddToCart = () => {
    if (!addToCart(product)) {
      return
    }
    setJustAdded(true)
    if (addedTimerRef.current !== null) {
      clearTimeout(addedTimerRef.current)
    }
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 1600)
  }

  const unavailable = product.inStock <= 0

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:shadow-card',
        'active:scale-[0.99]',
        className,
      )}
    >
      <Link
        to={`/product/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="p-3 pb-0">
          <ProductVisual category={product.category} className="w-full rounded-[10px]" />
        </div>

        <div className="flex flex-col gap-2 px-5 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-12 font-medium text-muted">
              {product.brand}
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-warn">
                <Star aria-hidden="true" strokeWidth={1.75} className="size-4 fill-current" />
                <span className="font-mono text-12 tabular-nums">{product.rating.toFixed(1)}</span>
              </span>
              <span className="font-mono text-12 tabular-nums text-muted">
                ({product.reviewsCount})
              </span>
            </span>
          </div>

          <p className="line-clamp-2 min-h-12 text-16 font-medium leading-snug">{product.name}</p>
        </div>
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `${product.name}: убрать из избранного`
            : `${product.name}: добавить в избранное`
        }
        onClick={() => toggleFavorite(product.id)}
        className="absolute right-3 top-3 z-10 border border-border bg-background/75 text-muted backdrop-blur-sm hover:text-foreground"
      >
        <Heart
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn('size-[18px]', isFavorite && 'fill-current text-accent')}
        />
      </Button>

      <div className="mt-auto flex flex-col gap-3 px-5 pb-5 pt-3">
        <div>
          <p className="font-mono text-24 font-semibold leading-none tabular-nums">
            {formatPrice(product.price)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-12 tabular-nums text-muted line-through">
              {formatPrice(product.marketPrice)}
            </span>
            {discount > 0 && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-12 tabular-nums font-medium text-accent">
                −{discount}%
              </span>
            )}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-12 text-muted">
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', unavailable ? 'bg-muted' : 'bg-success')}
          />
          {unavailable ? 'Под заказ' : `В наличии: ${product.inStock} шт`}
        </p>

        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={unavailable}
          onClick={handleAddToCart}
          aria-label={
            justAdded ? `${product.name}: уже в корзине` : `Добавить ${product.name} в корзину`
          }
          className="w-full"
        >
          {justAdded ? (
            <>
              <Check aria-hidden="true" strokeWidth={1.75} />В корзине
            </>
          ) : (
            <>
              <Plus aria-hidden="true" strokeWidth={1.75} />В корзину
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
