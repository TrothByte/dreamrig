import { type ProductInput, productSchema } from '../../model/product'
import type { AdminRepository } from '../admin-repo'
import { isMockAdmin } from './auth-repo'
import { products } from './generate-catalog'

function uniqueSlug(base: string): string {
  let slug = base
  let index = 1
  while (products.some((product) => product.slug === slug)) {
    slug = `${base}-${index}`
    index += 1
  }
  return slug
}

export class MockAdminRepository implements AdminRepository {
  async isAdmin(): Promise<boolean> {
    return isMockAdmin()
  }

  async createProduct(input: ProductInput, slug: string): Promise<{ id: string }> {
    const id = crypto.randomUUID()
    const product = productSchema.parse({
      id,
      slug: uniqueSlug(slug),
      name: input.name,
      brand: input.brand,
      category: input.category,
      price: input.price,
      marketPrice: input.marketPrice,
      specs: input.specs,
      inStock: input.inStock,
      rating: 0,
      reviewsCount: 0,
      description: input.description,
      createdAt: new Date().toISOString(),
    })
    products.push(product)
    return { id }
  }

  async updateProduct(id: string, input: ProductInput, slug: string): Promise<void> {
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) {
      throw new Error('Товар не найден')
    }
    const current = products[index]
    products[index] = productSchema.parse({
      ...current,
      slug: uniqueSlug(slug),
      name: input.name,
      brand: input.brand,
      category: input.category,
      price: input.price,
      marketPrice: input.marketPrice,
      specs: input.specs,
      inStock: input.inStock,
      description: input.description,
    })
  }

  async deleteProduct(id: string): Promise<void> {
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) {
      throw new Error('Товар не найден')
    }
    products.splice(index, 1)
  }
}
