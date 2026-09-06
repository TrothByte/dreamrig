import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { getAuthRepository } from '@/shared/api'
import { getApiMode } from '@/shared/config'
import { type SignUpFormData, signUpFormSchema } from '@/shared/model/auth'
import { Button, FakeCaptcha } from '@/shared/ui'

const inputClass =
  'w-full rounded-btn border border-border bg-background px-3 py-2.5 text-16 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ label, required = true, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-14 font-medium">
        {label}
        {!required && <span className="ml-1 font-normal text-muted">(необязательно)</span>}
      </span>
      {children}
      {error !== undefined ? (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      ) : hint !== undefined ? (
        <p className="text-12 text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { alias: '' },
  })
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = handleSubmit(async (data) => {
    if (!captchaVerified) {
      setCaptchaError(true)
      return
    }
    setCaptchaError(false)
    setFormError(null)
    try {
      const profile = await getAuthRepository().signUp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        alias: data.alias?.trim() || undefined,
        password: data.password,
      })
      if (profile === null) {
        toast.info('Аккаунт создан. Войдите с указанной почтой')
        navigate('/login', { replace: true })
        return
      }
      toast.success('Аккаунт создан, добро пожаловать в DreamRig')
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось создать аккаунт')
    }
  })

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">Регистрация</h1>
          <p className="mt-2 text-14 text-muted">Создайте аккаунт, чтобы покупать быстрее.</p>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Имя" error={errors.firstName?.message}>
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder="Иван"
                  className={inputClass}
                  {...register('firstName')}
                />
              </Field>
              <Field label="Фамилия" error={errors.lastName?.message}>
                <input
                  type="text"
                  autoComplete="family-name"
                  placeholder="Иванов"
                  className={inputClass}
                  {...register('lastName')}
                />
              </Field>
            </div>

            <Field
              label="Псевдоним"
              required={false}
              hint="Если не указан, в отзывах будет имя и фамилия"
              error={errors.alias?.message}
            >
              <input
                type="text"
                autoComplete="nickname"
                placeholder="Например, rigMaster"
                className={inputClass}
                {...register('alias')}
              />
            </Field>

            <Field label="Пароль" error={errors.password?.message}>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 8 символов"
                className={inputClass}
                {...register('password')}
              />
            </Field>

            <Field label="Повторите пароль" error={errors.confirmPassword?.message}>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Ещё раз"
                className={inputClass}
                {...register('confirmPassword')}
              />
            </Field>

            <FakeCaptcha
              verified={captchaVerified}
              onChange={(verified) => {
                setCaptchaVerified(verified)
                if (verified) {
                  setCaptchaError(false)
                }
              }}
              error={captchaError}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-14 text-muted">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-accent hover:underline focus-visible:outline-none">
            Войти
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
