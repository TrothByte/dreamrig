import type { Article, ArticleRubric } from '../model/article'

export interface ArticleQueryParams {
  rubric?: ArticleRubric
  page?: number
  pageSize?: number
}

export interface ArticlePage {
  items: Article[]
  total: number
  page: number
  pageSize: number
}

export interface ArticleRepository {
  getArticles(params?: ArticleQueryParams): Promise<ArticlePage>
  getArticleBySlug(slug: string): Promise<Article | null>
  getRelatedArticles(slug: string, limit?: number): Promise<Article[]>
}
