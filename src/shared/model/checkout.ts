import { z } from 'zod'

export const checkoutContactSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя и фамилию'),
  phone: z
    .string()
    .trim()
    .min(5, 'Введите номер телефона')
    .refine(
      (value) => /^(\+7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}$/.test(value),
      'Введите корректный телефон: +7 XXX XXX-XX-XX',
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Введите корректный email'),
})

export type CheckoutContact = z.infer<typeof checkoutContactSchema>

export const checkoutDeliverySchema = z.object({
  city: z.string().trim().min(2, 'Введите город'),
  address: z.string().trim().min(5, 'Введите адрес: улица, дом, квартира'),
  comment: z.string().trim().max(500, 'Комментарий не длиннее 500 символов').optional(),
})

export type CheckoutDelivery = z.infer<typeof checkoutDeliverySchema>
