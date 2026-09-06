import { cn } from '@/shared/lib'
import type { Product } from '@/shared/model'
import { ProductCard } from './product-card'

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
