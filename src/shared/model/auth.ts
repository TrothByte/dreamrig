import { z } from 'zod'

const emailField = z
  .string()
  .trim()
  .min(1, 'Введите email')
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Введите корректный email')

const passwordField = z.string().min(8, 'Пароль — минимум 8 символов')

export const authProfileSchema = z.object({
  id: z.string().min(1),
  email: emailField,
  firstName: z.string().trim().min(1, 'Укажите имя'),
  lastName: z.string().trim().min(1, 'Укажите фамилию'),
  alias: z
    .string()
    .trim()
    .max(40, 'Псевдоним не длиннее 40 символов')
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value)),
})

export type AuthProfile = z.infer<typeof authProfileSchema>

export const signUpSchema = z.object({
  email: emailField,
  firstName: z.string().trim().min(1, 'Укажите имя'),
  lastName: z.string().trim().min(1, 'Укажите фамилию'),
  alias: z.string().trim().max(40, 'Псевдоним не длиннее 40 символов').optional(),
  password: passwordField,
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const signUpFormSchema = signUpSchema
  .extend({ confirmPassword: z.string().min(1, 'Повторите пароль') })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpFormSchema>

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Введите email'),
  password: z.string().min(1, 'Введите пароль'),
})

export type SignInInput = z.infer<typeof signInSchema>

export function displayName(profile: AuthProfile): string {
  return profile.alias ?? `${profile.firstName} ${profile.lastName}`
}

export function displayInitials(profile: AuthProfile): string {
  const source = profile.alias ?? `${profile.firstName} ${profile.lastName}`
  const parts = source.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}
