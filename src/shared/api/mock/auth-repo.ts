import type { AuthProfile, SignInInput, SignUpInput } from '../../model/auth'
import type { AuthRepository } from '../auth-repo'

// Mock-режим: аккаунты живут в памяти процесса (dev/e2e без сети).
// Настоящее хранение — PostgreSQL (Supabase) при VITE_API_MODE=supabase.

interface MockUser {
  profile: AuthProfile
  password: string
}

const DEMO_ID = '00000000-0000-0000-0000-000000000001'

const users = new Map<string, MockUser>([
  [
    'demo@dreamrig.ru',
    {
      password: 'demo1234',
      profile: {
        id: DEMO_ID,
        email: 'demo@dreamrig.ru',
        firstName: 'Демо',
        lastName: 'Пользователь',
        alias: 'demo',
      },
    },
  ],
])

let currentProfile: AuthProfile | null = null
const listeners = new Set<(profile: AuthProfile | null) => void>()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function emit(profile: AuthProfile | null): void {
  currentProfile = profile
  for (const listener of listeners) {
    listener(profile)
  }
}

export class MockAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthProfile | null> {
    await delay(150)
    return currentProfile
  }

  async signUp(input: SignUpInput): Promise<AuthProfile | null> {
    await delay(400)
    const email = input.email.trim().toLowerCase()
    if (users.has(email)) {
      throw new Error('Пользователь с такой почтой уже зарегистрирован')
    }
    const profile: AuthProfile = {
      id: crypto.randomUUID(),
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      alias: input.alias?.trim() || undefined,
    }
    users.set(email, { profile, password: input.password })
    emit(profile)
    return profile
  }

  async signIn(input: SignInInput): Promise<AuthProfile> {
    await delay(350)
    const email = input.email.trim().toLowerCase()
    const user = users.get(email)
    if (user === undefined || user.password !== input.password) {
      throw new Error('Неверный email или пароль')
    }
    emit(user.profile)
    return user.profile
  }

  async signOut(): Promise<void> {
    await delay(150)
    emit(null)
  }

  onAuthStateChange(listener: (profile: AuthProfile | null) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
}

export function getMockProfile(): AuthProfile | null {
  return currentProfile
}

export function isMockAdmin(): boolean {
  return (
    currentProfile !== null &&
    (currentProfile.email === 'demo@dreamrig.ru' || currentProfile.email === 'admin@dreamrig.ru')
  )
}
