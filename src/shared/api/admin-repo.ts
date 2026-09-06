import type { ProductInput } from '../model/product'

export interface AdminRepository {
  isAdmin(): Promise<boolean>
  createProduct(input: ProductInput, slug: string): Promise<{ id: string }>
  updateProduct(id: string, input: ProductInput, slug: string): Promise<void>
  deleteProduct(id: string): Promise<void>
}
