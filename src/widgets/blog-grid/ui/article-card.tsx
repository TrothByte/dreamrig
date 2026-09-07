import { Clock } from 'lucide-react'
import { Link } from 'react-router'
import { ARTICLE_RUBRIC_LABELS, assetUrl, cn, formatArticleDate } from '@/shared/lib'
import type { Article } from '@/shared/model'

interface ArticleCardProps {
  article: Article
  className?: string
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:shadow-card',
        'active:scale-[0.99]',
        className,
      )}
    >
      <Link
        to={`/blog/${article.slug}`}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          <img
            src={assetUrl(article.coverPath)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2.5 text-12">
            <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
              {ARTICLE_RUBRIC_LABELS[article.rubric]}
            </span>
            <time className="font-mono tabular-nums text-muted">
              {formatArticleDate(article.publishedAt, true)}
            </time>
          </div>

          <h3 className="line-clamp-2 text-16 font-semibold leading-snug tracking-tight sm:text-20 sm:leading-snug">
            {article.title}
          </h3>

          <p className="line-clamp-3 text-14 leading-relaxed text-muted">{article.excerpt}</p>

          <div className="mt-auto flex items-center gap-2 border-t border-border pt-3 text-12 text-muted">
            <span className="truncate">{article.author}</span>
            <span aria-hidden="true">·</span>
            <span className="flex shrink-0 items-center gap-1">
              <Clock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
              <span className="font-mono tabular-nums">{article.readingMinutes} мин</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
