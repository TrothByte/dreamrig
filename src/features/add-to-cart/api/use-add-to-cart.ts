import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import type { Product } from '@/shared/model'

export function useAddToCart() {
  const addProduct = useCartStore((state) => state.addProduct)

  return useCallback(
    (product: Product, qty = 1): boolean => {
      const result = addProduct(product, qty)
      if (result === 'out-of-stock') {
        toast.error('Товара нет в наличии')
        return false
      }
      if (result === 'limit') {
        toast.error(`Доступно только ${product.inStock} шт`)
        return false
      }
      toast.success('Добавлено в корзину', { description: product.name })
      return true
    },
    [addProduct],
  )
}
