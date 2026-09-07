import { type Article, articleSchema } from '../../model/article'
import type { ArticlePage, ArticleQueryParams, ArticleRepository } from '../article-repo'
import { getSupabaseClient } from './client'

const ARTICLE_COLUMNS =
  'id, slug, title, excerpt, rubric, cover_path, author, author_role, reading_minutes, body, published_at'

function toIsoString(value: unknown): string {
  return new Date(value instanceof Date ? value.getTime() : String(value)).toISOString()
}

function parseArticleRow(row: unknown): Article {
  const record = row as Record<string, unknown>
  return articleSchema.parse({
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    rubric: record.rubric,
    coverPath: record.cover_path,
    author: record.author,
    authorRole: record.author_role,
    readingMinutes: record.reading_minutes,
    body: record.body,
    publishedAt: toIsoString(record.published_at),
  })
}

export class SupabaseArticleRepository implements ArticleRepository {
  async getArticles(params: ArticleQueryParams = {}): Promise<ArticlePage> {
    const client = getSupabaseClient()
    const { rubric } = params
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 9

    let query = client.from('articles').select(ARTICLE_COLUMNS, { count: 'exact' })
    if (rubric !== undefined) {
      query = query.eq('rubric', rubric)
    }
    query = query.order('published_at', { ascending: false })

    const start = (page - 1) * pageSize
    const { data, error, count } = await query.range(start, start + pageSize - 1)

    if (error !== null) {
      throw new Error(`Не удалось загрузить статьи: ${error.message}`)
    }

    const items = (data ?? []).map(parseArticleRow)
    return { items, total: count ?? items.length, page, pageSize }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('slug', slug)
      .maybeSingle()

    if (error !== null) {
      throw new Error(`Не удалось загрузить статью: ${error.message}`)
    }

    return data === null ? null : parseArticleRow(data)
  }

  async getRelatedArticles(slug: string, limit = 3): Promise<Article[]> {
    const client = getSupabaseClient()
    const current = await this.getArticleBySlug(slug)
    if (current === null) {
      return []
    }

    const { data: sameRubric, error: sameRubricError } = await client
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('rubric', current.rubric)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (sameRubricError !== null) {
      throw new Error(`Не удалось загрузить похожие статьи: ${sameRubricError.message}`)
    }

    const related = [...(sameRubric ?? [])]
    if (related.length < limit) {
      const { data: otherRubric, error: otherRubricError } = await client
        .from('articles')
        .select(ARTICLE_COLUMNS)
        .neq('rubric', current.rubric)
        .order('published_at', { ascending: false })
        .limit(limit - related.length)

      if (otherRubricError !== null) {
        throw new Error(`Не удалось загрузить похожие статьи: ${otherRubricError.message}`)
      }
      related.push(...(otherRubric ?? []))
    }

    return related.map(parseArticleRow)
  }
}
