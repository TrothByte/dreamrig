import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteState {
  ids: string[]
  toggle: (productId: string) => void
  clear: () => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'dreamrig-favorites' },
  ),
)

export function selectIsFavorite(productId: string) {
  return (state: FavoriteState): boolean => state.ids.includes(productId)
}
