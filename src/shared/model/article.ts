import { z } from 'zod'

export const articleRubricSchema = z.enum(['news', 'review', 'guide'])

export type ArticleRubric = z.infer<typeof articleRubricSchema>

export const articleBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('paragraph'),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('heading'),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('quote'),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('list'),
    ordered: z.boolean().default(false),
    items: z.array(z.string().min(1)).min(1),
  }),
])

export type ArticleBlock = z.infer<typeof articleBlockSchema>

export const articleSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(400),
  rubric: articleRubricSchema,
  coverPath: z.string().min(1),
  author: z.string().min(1),
  authorRole: z.string().min(1),
  readingMinutes: z.number().int().positive(),
  body: z.array(articleBlockSchema).min(1),
  publishedAt: z.string().datetime(),
})

export type Article = z.infer<typeof articleSchema>
