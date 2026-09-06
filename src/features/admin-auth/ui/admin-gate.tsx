import { useQuery } from '@tanstack/react-query'
import { type FormEvent, type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user'
import { getAdminRepository, getAuthRepository } from '@/shared/api'
import { Button } from '@/shared/ui'

const inputClass =
  'w-full rounded-btn border border-border bg-background px-3 py-2.5 text-16 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

function AdminLoginPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await getAuthRepository().signIn({ email, password })
      toast.success('Вход выполнен')
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Не удалось войти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-24 font-semibold tracking-tight">Войдите как администратор</h1>
        <p className="mt-2 text-14 text-muted">Используйте учётную запись из staff-таблицы.</p>
        {error !== null && (
          <p
            role="alert"
            className="mt-4 rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-14 text-danger"
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            autoComplete="email"
            placeholder="admin@dreamrig.ru"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Пароль"
            className={inputClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Входим…' : 'Войти'}
          </Button>
        </form>
      </div>
    </section>
  )
}

export function AdminGate({ children }: { children: ReactNode }) {
  const profile = useAuthStore((state) => state.profile)
  const status = useAuthStore((state) => state.status)
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', profile?.id],
    queryFn: () => getAdminRepository().isAdmin(),
    enabled: status === 'authed' && profile !== null,
  })

  if (status === 'anon') {
    return <AdminLoginPanel />
  }

  if (status === 'checking' || isAdmin === undefined) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="skeleton h-8 w-48 rounded-md" aria-hidden="true" />
      </section>
    )
  }

  if (isAdmin === false) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <h1 className="text-24 font-semibold tracking-tight">Нет прав администратора</h1>
        <p className="max-w-md text-14 text-muted">
          Этот раздел доступен только сотрудникам DreamRig.
        </p>
        <Button variant="secondary" onClick={() => void getAuthRepository().signOut()}>
          Выйти
        </Button>
      </section>
    )
  }

  return children
}
