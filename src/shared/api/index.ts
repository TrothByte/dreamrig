import { getApiMode } from '../config/env'
import type { AdminRepository } from './admin-repo'
import type { ArticleRepository } from './article-repo'
import type { AuthRepository } from './auth-repo'
import { MockAdminRepository } from './mock/admin-repo'
import { MswArticleRepository } from './mock/article-repo'
import { MockAuthRepository } from './mock/auth-repo'
import { MswProductRepository } from './mock/product-repo'
import type { ProductRepository } from './product-repo'
import { SupabaseAdminRepository } from './supabase/admin-repo'
import { SupabaseArticleRepository } from './supabase/article-repo'
import { SupabaseAuthRepository } from './supabase/auth-repo'
import { SupabaseProductRepository } from './supabase/product-repo'

let repository: ProductRepository | null = null
let articleRepository: ArticleRepository | null = null
let authRepository: AuthRepository | null = null
let adminRepository: AdminRepository | null = null

export function getProductRepository(): ProductRepository {
  if (repository === null) {
    repository =
      getApiMode() === 'supabase' ? new SupabaseProductRepository() : new MswProductRepository()
  }
  return repository
}

export function getArticleRepository(): ArticleRepository {
  if (articleRepository === null) {
    articleRepository =
      getApiMode() === 'supabase' ? new SupabaseArticleRepository() : new MswArticleRepository()
  }
  return articleRepository
}

export function getAuthRepository(): AuthRepository {
  if (authRepository === null) {
    authRepository =
      getApiMode() === 'supabase' ? new SupabaseAuthRepository() : new MockAuthRepository()
  }
  return authRepository
}

export function getAdminRepository(): AdminRepository {
  if (adminRepository === null) {
    adminRepository =
      getApiMode() === 'supabase' ? new SupabaseAdminRepository() : new MockAdminRepository()
  }
  return adminRepository
}
