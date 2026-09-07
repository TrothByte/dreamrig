// Временные типы БД. Замените на сгенерированные:
// npx supabase gen types typescript --project-id <project-id> --schema public > src/shared/api/supabase/database.types.ts

export interface ProductRow {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  market_price: number
  specs: Record<string, string>
  in_stock: number
  rating: number
  reviews_count: number
  description: string
  created_at: string
}

export type ProductInsert = {
  id?: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  market_price: number
  specs: Record<string, string>
  in_stock: number
  rating?: number
  reviews_count?: number
  description: string
  created_at?: string
  updated_at?: string
}

export interface ArticleRow {
  id: string
  slug: string
  title: string
  excerpt: string
  rubric: string
  cover_path: string
  author: string
  author_role: string
  reading_minutes: number
  body: unknown
  published_at: string
  created_at: string
  updated_at: string
}

export type ArticleInsert = {
  id?: string
  slug: string
  title: string
  excerpt: string
  rubric: string
  cover_path: string
  author: string
  author_role?: string
  reading_minutes: number
  body: unknown
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface ProfileRow {
  id: string
  email: string
  first_name: string
  last_name: string
  alias: string | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = {
  id: string
  email: string
  first_name: string
  last_name: string
  alias?: string | null
}

type OrderRowShape = {
  id: number
  customer: unknown
  delivery: unknown
  total: number
  status: string
  created_at: string
}

type OrderInsertShape = {
  id?: number
  customer: unknown
  delivery: unknown
  total: number
  status?: string
  created_at?: string
}

type OrderItemRowShape = {
  id: number
  order_id: number
  product_id: string
  qty: number
  price_at_purchase: number
}

type OrderItemInsertShape = {
  id?: number
  order_id: number
  product_id: string
  qty: number
  price_at_purchase: number
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: Partial<Omit<ProfileRow, 'id' | 'email' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      products: {
        Row: ProductRow
        Insert: ProductInsert
        Update: Partial<ProductInsert>
        Relationships: []
      }
      articles: {
        Row: ArticleRow
        Insert: ArticleInsert
        Update: Partial<ArticleInsert>
        Relationships: []
      }
      orders: {
        Row: OrderRowShape
        Insert: OrderInsertShape
        Update: Partial<OrderInsertShape>
        Relationships: []
      }
      order_items: {
        Row: OrderItemRowShape
        Insert: OrderItemInsertShape
        Update: Partial<OrderItemInsertShape>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
