import { getSupabaseEnv } from '../../config/env'
import type { ProductInput } from '../../model/product'
import type { AdminRepository } from '../admin-repo'
import { getSupabaseClient } from './client'

function toRow(input: ProductInput, slug: string): Record<string, unknown> {
  return {
    slug,
    name: input.name,
    brand: input.brand,
    category: input.category,
    price: input.price,
    market_price: input.marketPrice,
    specs: input.specs,
    in_stock: input.inStock,
    description: input.description,
  }
}

async function getAccessToken(): Promise<string> {
  const client = getSupabaseClient()
  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  if (token === undefined || token === '') {
    throw new Error('Выполните вход как администратор')
  }
  return token
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  throw new Error(body?.message ?? fallback)
}

export class SupabaseAdminRepository implements AdminRepository {
  async isAdmin(): Promise<boolean> {
    const { url, anonKey } = getSupabaseEnv()
    const token = await getAccessToken()
    const response = await fetch(`${url}/rest/v1/rpc/am_i_admin`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
    if (!response.ok) {
      return false
    }
    return Boolean(await response.json())
  }

  async createProduct(input: ProductInput, slug: string): Promise<{ id: string }> {
    const { url, anonKey } = getSupabaseEnv()
    const token = await getAccessToken()
    const response = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(toRow(input, slug)),
    })
    if (!response.ok) {
      await parseError(response, 'Не удалось создать товар')
    }
    const rows = (await response.json()) as unknown as Array<{ id?: string }>
    const id = rows[0]?.id
    if (id === undefined) {
      throw new Error('Не удалось создать товар: пустой ответ')
    }
    return { id }
  }

  async updateProduct(id: string, input: ProductInput, slug: string): Promise<void> {
    const { url, anonKey } = getSupabaseEnv()
    const token = await getAccessToken()
    const response = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ...toRow(input, slug), updated_at: new Date().toISOString() }),
    })
    if (!response.ok) {
      await parseError(response, 'Не удалось обновить товар')
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const { url, anonKey } = getSupabaseEnv()
    const token = await getAccessToken()
    const response = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
    })
    if (!response.ok) {
      await parseError(response, 'Не удалось удалить товар')
    }
  }
}
