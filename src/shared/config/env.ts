export type ApiMode = 'mock' | 'supabase'

export function getApiMode(): ApiMode {
  return import.meta.env.VITE_API_MODE === 'supabase' ? 'supabase' : 'mock'
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  return {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  }
}
