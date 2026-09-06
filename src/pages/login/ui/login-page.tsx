import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { getAuthRepository } from '@/shared/api'
import { getApiMode } from '@/shared/config'
import { displayName, type SignInInput, signInSchema } from '@/shared/model/auth'
import { Button } from '@/shared/ui'

const inputClass =
  'w-full rounded-btn border border-border bg-background px-3 py-2.5 text-16 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-14 font-medium">{label}</span>
      {children}
      {error !== undefined && (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null)
    try {
      const profile = await getAuthRepository().signIn(data)
      toast.success(`С возвращением, ${displayName(profile)}`)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось войти')
    }
  })

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">Вход</h1>
          <p className="mt-2 text-14 text-muted">Рады видеть вас снова в DreamRig.</p>

          {formError !== null && (
            <p
              role="alert"
              className="mt-4 rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-14 text-danger"
            >
              {formError}
            </p>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.ru"
                className={inputClass}
                {...register('email')}
              />
            </Field>

            <Field label="Пароль" error={errors.password?.message}>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Ваш пароль"
                className={inputClass}
                {...register('password')}
              />
            </Field>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Входим…' : 'Войти'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-14 text-muted">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-accent hover:underline focus-visible:outline-none">
            Зарегистрироваться
          </Link>
        </p>

        {getApiMode() === 'mock' && (
          <p className="mt-6 rounded-btn border border-border bg-surface px-4 py-3 text-center text-12 text-muted">
            Демо-доступ (режим моков): demo@dreamrig.ru · пароль demo1234
          </p>
        )}
      </div>
    </section>
  )
}
