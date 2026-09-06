import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/entities/user'
import { getAuthRepository } from '@/shared/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setProfile = useAuthStore((state) => state.setProfile)
  const setStatus = useAuthStore((state) => state.setStatus)

  useEffect(() => {
    let disposed = false
    const repository = getAuthRepository()
    const unsubscribe = repository.onAuthStateChange((profile) => {
      if (!disposed) {
        setProfile(profile)
      }
    })

    void repository
      .getSession()
      .then((profile) => {
        if (disposed) {
          return
        }
        setProfile(profile)
        setStatus(profile === null ? 'anon' : 'authed')
      })
      .catch(() => {
        if (!disposed) {
          setProfile(null)
          setStatus('anon')
        }
      })

    return () => {
      disposed = true
      unsubscribe()
    }
  }, [setProfile, setStatus])

  return children
}
