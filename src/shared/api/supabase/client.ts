import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '../../config/env'
import type { Database } from './database.types'

let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (clientInstance !== null) {
    return clientInstance
  }

  const { url, anonKey } = getSupabaseEnv()
  if (url === '' || anonKey === '') {
    throw new Error(
      'Для VITE_API_MODE=supabase заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env',
    )
  }

  clientInstance = createClient<Database>(url, anonKey)
  return clientInstance
}
