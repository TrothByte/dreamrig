import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/shared/lib'
import type { Product } from '@/shared/model'
import { ProductCard } from './product-card'

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={reducedMotion === true ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            delay: reducedMotion === true ? 0 : Math.min(index * 0.03, 0.36),
            ease: 'easeOut',
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  )
}
