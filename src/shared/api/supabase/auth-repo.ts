import type { User } from '@supabase/supabase-js'
import type { AuthProfile, SignInInput, SignUpInput } from '../../model/auth'
import type { AuthRepository } from '../auth-repo'
import { getSupabaseClient } from './client'

function profileFromUser(user: User | null): AuthProfile | null {
  if (user === null) {
    return null
  }
  const meta = user.user_metadata as Record<string, unknown>
  const firstName = typeof meta.first_name === 'string' ? meta.first_name : ''
  const lastName = typeof meta.last_name === 'string' ? meta.last_name : ''
  const alias = typeof meta.alias === 'string' && meta.alias.trim() !== '' ? meta.alias : undefined
  return {
    id: user.id,
    email: user.email ?? '',
    firstName,
    lastName,
    alias,
  }
}

function toFriendlyError(error: { message: string; status?: number; code?: string }): Error {
  if (error.code === 'user_already_exists' || error.status === 422) {
    return new Error('Пользователь с такой почтой уже зарегистрирован')
  }
  if (error.code === 'invalid_credentials') {
    return new Error('Неверный email или пароль')
  }
  if (error.status === 429) {
    return new Error('Слишком много попыток. Подождите минуту и повторите')
  }
  return new Error(error.message)
}

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthProfile | null> {
    const client = getSupabaseClient()
    const { data } = await client.auth.getSession()
    return profileFromUser(data.session?.user ?? null)
  }

  async signUp(input: SignUpInput): Promise<AuthProfile | null> {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          first_name: input.firstName.trim(),
          last_name: input.lastName.trim(),
          alias: input.alias?.trim() || null,
        },
      },
    })
    if (error !== null) {
      throw toFriendlyError(error)
    }
    if (data.session === null) {
      // Email-подтверждение включено в проекте: аккаунт создан, но сессии нет
      return null
    }
    return profileFromUser(data.user ?? null)
  }

  async signIn(input: SignInInput): Promise<AuthProfile> {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    })
    if (error !== null) {
      throw toFriendlyError(error)
    }
    const profile = profileFromUser(data.user)
    if (profile === null) {
      throw new Error('Не удалось получить профиль пользователя')
    }
    return profile
  }

  async signOut(): Promise<void> {
    const client = getSupabaseClient()
    const { error } = await client.auth.signOut()
    if (error !== null) {
      throw toFriendlyError(error)
    }
  }

  onAuthStateChange(listener: (profile: AuthProfile | null) => void): () => void {
    const client = getSupabaseClient()
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      listener(profileFromUser(session?.user ?? null))
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }
}
