import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/shared/model'

export interface CartLine {
  productId: string
  slug: string
  name: string
  category: Product['category']
  priceAtPurchase: number
  marketPrice: number
  inStock: number
  qty: number
}

export type AddProductResult = 'added' | 'limit' | 'out-of-stock'

export interface CartState {
  lines: CartLine[]
  addProduct: (product: Product, qty?: number) => AddProductResult
  setQty: (productId: string, qty: number) => void
  removeLine: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addProduct: (product, qty = 1) => {
        const state = get()
        if (product.inStock <= 0) {
          return 'out-of-stock'
        }
        const existing = state.lines.find((line) => line.productId === product.id)
        if (existing !== undefined && existing.qty >= product.inStock) {
          return 'limit'
        }
        const requested = existing === undefined ? qty : existing.qty + qty
        const nextQty = Math.min(requested, product.inStock)
        set((current) => {
          if (existing === undefined) {
            return {
              lines: [
                ...current.lines,
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  priceAtPurchase: product.price,
                  marketPrice: product.marketPrice,
                  inStock: product.inStock,
                  qty: nextQty,
                },
              ],
            }
          }
          return {
            lines: current.lines.map((line) =>
              line.productId === product.id ? { ...line, qty: nextQty } : line,
            ),
          }
        })
        return 'added'
      },
      setQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { lines: state.lines.filter((line) => line.productId !== productId) }
          }
          return {
            lines: state.lines.map((line) =>
              line.productId === productId ? { ...line, qty: Math.min(qty, line.inStock) } : line,
            ),
          }
        }),
      removeLine: (productId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.productId !== productId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'dreamrig-cart-v1' },
  ),
)

export function selectCartTotalQty(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function selectCartTotals(state: CartState): {
  total: number
  marketTotal: number
  savings: number
  count: number
} {
  const total = state.lines.reduce((sum, line) => sum + line.priceAtPurchase * line.qty, 0)
  const marketTotal = state.lines.reduce((sum, line) => sum + line.marketPrice * line.qty, 0)
  return {
    total,
    marketTotal,
    savings: marketTotal - total,
    count: state.lines.reduce((sum, line) => sum + line.qty, 0),
  }
}
