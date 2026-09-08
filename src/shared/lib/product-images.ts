import type { Category } from '../model/product'
import { getProductPhoto } from './product-photo-index'

const IMAGE_EXTENSION = '.jpg'

function getBaseUrl(): string {
  return import.meta.env?.BASE_URL ?? ''
}

export function productPhotoFileNumber(slug: string): number | null {
  return getProductPhoto(slug)?.n ?? null
}

export function productPhotoUrl(productNumber: number, shot: number): string {
  const suffix = shot > 1 ? `-${shot}` : ''
  return `${getBaseUrl()}products/${productNumber}${suffix}${IMAGE_EXTENSION}`
}

export function resolveProductImage(slug: string, _category: Category): string | null {
  const productNumber = productPhotoFileNumber(slug)
  return productNumber === null ? null : productPhotoUrl(productNumber, 1)
}

export function resolveProductPhotoUrls(slug: string, maxShots = 4): string[] {
  const productNumber = productPhotoFileNumber(slug)
  if (productNumber === null) {
    return []
  }
  return Array.from({ length: maxShots }, (_, index) => productPhotoUrl(productNumber, index + 1))
}
