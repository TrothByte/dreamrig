import type { ArticleRubric } from '../model/article'

export const ARTICLE_RUBRIC_LABELS: Record<ArticleRubric, string> = {
  news: 'Новости',
  review: 'Обзоры',
  guide: 'Гайды',
}

export const ARTICLE_RUBRIC_ORDER: ArticleRubric[] = ['news', 'review', 'guide']

const articleDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const articleDateShortFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatArticleDate(value: string, short = false): string {
  const formatter = short ? articleDateShortFormatter : articleDateFormatter
  return formatter.format(new Date(value))
}
