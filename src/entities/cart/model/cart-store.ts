import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/shared/model'

export interface CartLine {
  productId: string
  slug: string
  name: string
  priceAtPurchase: number
  inStock: number
  qty: number
}

export interface CartState {
  lines: CartLine[]
  addProduct: (product: Product, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  removeLine: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addProduct: (product, qty = 1) =>
        set((state) => {
          if (product.inStock <= 0 || qty <= 0) {
            return state
          }
          const existing = state.lines.find((line) => line.productId === product.id)
          if (existing === undefined) {
            return {
              lines: [
                ...state.lines,
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceAtPurchase: product.price,
                  inStock: product.inStock,
                  qty: Math.min(qty, product.inStock),
                },
              ],
            }
          }
          const nextQty = Math.min(existing.qty + qty, product.inStock)
          if (nextQty === existing.qty) {
            return state
          }
          return {
            lines: state.lines.map((line) =>
              line.productId === product.id ? { ...line, qty: nextQty } : line,
            ),
          }
        }),
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
    { name: 'dreamrig-cart' },
  ),
)

export function selectCartTotalQty(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function selectCartLineQty(productId: string) {
  return (state: CartState): number =>
    state.lines.find((line) => line.productId === productId)?.qty ?? 0
}
