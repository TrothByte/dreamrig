import { cn } from '@/shared/lib'
import type { Article } from '@/shared/model'
import { ArticleCard } from './article-card'

interface ArticleGridProps {
  articles: Article[]
  className?: string
}

export function ArticleGrid({ articles, className }: ArticleGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
