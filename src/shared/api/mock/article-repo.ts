import type { Article } from '../../model/article'
import type { ArticlePage, ArticleQueryParams, ArticleRepository } from '../article-repo'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)

  if (!response.ok) {
    throw new Error(`Ошибка запроса ${path}: ${response.status}`)
  }

  return (await response.json()) as T
}

function toSearchParams(params: ArticleQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (params.rubric !== undefined) {
    searchParams.set('rubric', params.rubric)
  }
  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 9))

  return searchParams
}

export class MswArticleRepository implements ArticleRepository {
  async getArticles(params: ArticleQueryParams = {}): Promise<ArticlePage> {
    const query = toSearchParams(params).toString()
    return requestJson<ArticlePage>(`/api/articles?${query}`)
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return requestJson<Article | null>(`/api/articles/${encodeURIComponent(slug)}`)
  }

  async getRelatedArticles(slug: string, limit = 3): Promise<Article[]> {
    return requestJson<Article[]>(
      `/api/articles/${encodeURIComponent(slug)}/related?limit=${limit}`,
    )
  }
}
