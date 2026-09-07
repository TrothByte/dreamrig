import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getArticleRepository } from '@/shared/api'
import type { ArticleQueryParams } from '@/shared/api/article-repo'

export function useArticles(params?: ArticleQueryParams) {
  return useQuery({
    queryKey: ['articles', params ?? {}],
    queryFn: () => getArticleRepository().getArticles(params),
    placeholderData: keepPreviousData,
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticleRepository().getArticleBySlug(slug),
    enabled: slug.length > 0,
  })
}

export function useRelatedArticles(slug: string, limit = 3) {
  return useQuery({
    queryKey: ['article', slug, 'related', limit],
    queryFn: () => getArticleRepository().getRelatedArticles(slug, limit),
    enabled: slug.length > 0,
  })
}
