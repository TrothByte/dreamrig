import { z } from 'zod'

export const categorySchema = z.enum([
  'cpu',
  'gpu',
  'ram',
  'storage',
  'motherboard',
  'psu',
  'cooling',
  'case',
  'peripherals',
])

export type Category = z.infer<typeof categorySchema>

export const productSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().min(1),
    category: categorySchema,
    price: z.number().int().positive(),
    marketPrice: z.number().int().positive(),
    specs: z.record(z.string(), z.string()),
    inStock: z.number().int().nonnegative(),
    rating: z.number().min(0).max(5),
    reviewsCount: z.number().int().nonnegative(),
    description: z.string().min(1),
    createdAt: z.string().datetime(),
  })
  .refine((product) => product.marketPrice >= product.price, {
    message: 'Рыночная цена не может быть ниже нашей цены',
    path: ['marketPrice'],
  })

export type Product = z.infer<typeof productSchema>

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Введите название').max(200, 'Слишком длинное название'),
    brand: z.string().trim().min(1, 'Введите бренд').max(80, 'Слишком длинный бренд'),
    category: categorySchema,
    price: z.number().int().positive('Цена должна быть больше нуля'),
    marketPrice: z.number().int().positive('Рыночная цена должна быть больше нуля'),
    inStock: z.number().int().nonnegative('Количество не может быть отрицательным'),
    description: z
      .string()
      .trim()
      .min(10, 'Описание — минимум 10 символов')
      .max(2000, 'Описание не длиннее 2000 символов'),
    specs: z.record(z.string(), z.string()),
  })
  .refine((product) => product.marketPrice >= product.price, {
    message: 'Рыночная цена не может быть ниже нашей цены',
    path: ['marketPrice'],
  })

export type ProductInput = z.infer<typeof productInputSchema>

export const reviewSchema = z.object({
  id: z.string().uuid(),
  productSlug: z.string().min(1),
  author: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1),
  createdAt: z.string().datetime(),
})

export type Review = z.infer<typeof reviewSchema>

export const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
})

export type Customer = z.infer<typeof customerSchema>

export const deliverySchema = z.object({
  city: z.string().min(1),
  address: z.string().min(1),
  comment: z.string().optional(),
})

export type Delivery = z.infer<typeof deliverySchema>

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
  priceAtPurchase: z.number().int().positive(),
})

export type OrderItem = z.infer<typeof orderItemSchema>

export const orderPayloadSchema = z.object({
  customer: customerSchema,
  delivery: deliverySchema,
  items: z.array(orderItemSchema).min(1),
})

export type OrderPayload = z.infer<typeof orderPayloadSchema>

export const orderSchema = z.object({
  id: z.string(),
  customer: customerSchema,
  delivery: deliverySchema,
  items: z.array(orderItemSchema).min(1),
  total: z.number().int().positive(),
  status: z.literal('new'),
  createdAt: z.string().datetime(),
})

export type Order = z.infer<typeof orderSchema>
