import { create } from 'zustand'
import type { AuthProfile } from '@/shared/model'

export type AuthStatus = 'checking' | 'anon' | 'authed'

export interface AuthState {
  profile: AuthProfile | null
  status: AuthStatus
  setProfile: (profile: AuthProfile | null) => void
  setStatus: (status: AuthStatus) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  profile: null,
  status: 'checking',
  setProfile: (profile) =>
    set({
      profile,
      status: profile === null ? 'anon' : 'authed',
    }),
  setStatus: (status) => set({ status }),
}))
