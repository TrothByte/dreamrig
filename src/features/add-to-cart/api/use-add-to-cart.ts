import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import type { Product } from '@/shared/model'

export function useAddToCart() {
  const addProduct = useCartStore((state) => state.addProduct)

  return useCallback(
    (product: Product, qty = 1) => {
      if (product.inStock <= 0) {
        toast.error('Товара нет в наличии')
        return
      }
      addProduct(product, qty)
      toast.success('Добавлено в корзину', { description: product.name })
    },
    [addProduct],
  )
}
