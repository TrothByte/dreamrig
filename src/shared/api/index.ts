import { getApiMode } from '../config/env'
import type { AuthRepository } from './auth-repo'
import { MockAuthRepository } from './mock/auth-repo'
import { MswProductRepository } from './mock/product-repo'
import type { ProductRepository } from './product-repo'
import { SupabaseAuthRepository } from './supabase/auth-repo'
import { SupabaseProductRepository } from './supabase/product-repo'

let repository: ProductRepository | null = null
let authRepository: AuthRepository | null = null

export function getProductRepository(): ProductRepository {
  if (repository === null) {
    repository =
      getApiMode() === 'supabase' ? new SupabaseProductRepository() : new MswProductRepository()
  }
  return repository
}

export function getAuthRepository(): AuthRepository {
  if (authRepository === null) {
    authRepository =
      getApiMode() === 'supabase' ? new SupabaseAuthRepository() : new MockAuthRepository()
  }
  return authRepository
}
