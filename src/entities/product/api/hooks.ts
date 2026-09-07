import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProductRepository } from '@/shared/api'
import type { ProductQueryParams } from '@/shared/api/product-repo'

const joinedIds = (ids: string[]) => ids.join(',')

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params ?? {}],
    queryFn: () => getProductRepository().getProducts(params),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductRepository().getProductBySlug(slug),
    enabled: slug.length > 0,
  })
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['products', 'by-ids', joinedIds(ids)],
    queryFn: () => getProductRepository().getProductsByIds(ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  })
}

export function useReviews(slug: string) {
  return useQuery({
    queryKey: ['product', slug, 'reviews'],
    queryFn: () => getProductRepository().getReviews(slug),
    enabled: slug.length > 0,
  })
}

export function useSimilar(slug: string, limit = 4) {
  return useQuery({
    queryKey: ['product', slug, 'similar', limit],
    queryFn: () => getProductRepository().getSimilar(slug, limit),
    enabled: slug.length > 0,
  })
}
