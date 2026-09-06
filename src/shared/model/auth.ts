import { z } from 'zod'

export const authProfileSchema = z.object({
  id: z.string().min(1),
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Введите корректный email'),
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

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Введите email')
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Введите корректный email'),
    firstName: z.string().trim().min(1, 'Укажите имя'),
    lastName: z.string().trim().min(1, 'Укажите фамилию'),
    alias: z.string().trim().max(40, 'Псевдоним не длиннее 40 символов').optional(),
    password: z.string().min(8, 'Пароль — минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
  .transform((data) => ({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    alias: data.alias === '' ? undefined : data.alias,
    password: data.password,
  }))

export type SignUpInput = z.output<typeof signUpSchema>

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
