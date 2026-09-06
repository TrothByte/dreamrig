import { getApiMode } from '../config/env'
import { MswProductRepository } from './mock/product-repo'
import type { ProductRepository } from './product-repo'
import { SupabaseProductRepository } from './supabase/product-repo'

let repository: ProductRepository | null = null

export function getProductRepository(): ProductRepository {
  if (repository === null) {
    repository =
      getApiMode() === 'supabase' ? new SupabaseProductRepository() : new MswProductRepository()
  }
  return repository
}
