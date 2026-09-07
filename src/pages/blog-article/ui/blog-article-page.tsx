import { CalendarDays, Clock, UserRound } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { useArticle, useRelatedArticles } from '@/entities/article'
import {
  ARTICLE_RUBRIC_LABELS,
  assetUrl,
  cn,
  formatArticleDate,
  useDocumentMeta,
} from '@/shared/lib'
import type { Article, ArticleBlock } from '@/shared/model'
import { Button } from '@/shared/ui'
import { ArticleGrid, ArticleGridSkeleton } from '@/widgets/blog-grid'

function ArticlePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl" aria-hidden="true">
      <div className="skeleton h-4 w-64 rounded-full" />
      <div className="mt-8 flex flex-col gap-4">
        <div className="skeleton h-5 w-28 rounded-full" />
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-6 w-2/3 rounded-md" />
      </div>
      <div className="mt-8 skeleton aspect-[16/9] rounded-card" />
      <div className="mt-8 flex flex-col gap-4">
        <div className="skeleton h-5 w-full rounded-md" />
        <div className="skeleton h-5 w-11/12 rounded-md" />
        <div className="skeleton h-5 w-full rounded-md" />
        <div className="skeleton h-5 w-3/4 rounded-md" />
      </div>
    </div>
  )
}

function getInitials(author: string): string {
  const parts = author.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function getBlockKey(block: ArticleBlock): string {
  if (block.type === 'list') {
    return `list-${block.items.length}-${block.items[0].slice(0, 24)}`
  }
  return `${block.type}-${block.text.slice(0, 32)}`
}

function ArticleBody({ body }: { body: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {body.map((block) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={getBlockKey(block)}
                className="pt-6 text-24 font-semibold leading-snug tracking-tight first:pt-0 sm:text-32 sm:leading-snug"
              >
                {block.text}
              </h2>
            )
          case 'quote':
            return (
              <blockquote
                key={getBlockKey(block)}
                className="my-2 rounded-r-card border-l-2 border-accent bg-accent-soft px-5 py-4 text-16 leading-relaxed text-foreground"
              >
                {block.text}
              </blockquote>
            )
          case 'list':
            return block.ordered ? (
              <ol
                key={getBlockKey(block)}
                className="flex list-decimal flex-col gap-2 pl-6 marker:font-mono marker:text-accent"
              >
                {block.items.map((item) => (
                  <li key={item} className="pl-1 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul
                key={getBlockKey(block)}
                className="flex list-disc flex-col gap-2 pl-6 marker:text-accent"
              >
                {block.items.map((item) => (
                  <li key={item} className="pl-1 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )
          default:
            return (
              <p key={getBlockKey(block)} className="text-16 leading-relaxed text-foreground/90">
                {block.text}
              </p>
            )
        }
      })}
    </div>
  )
}

function RelatedArticles({ article }: { article: Article }) {
  const { data: related, isPending } = useRelatedArticles(article.slug, 3)
  const items = related ?? []

  if (!isPending && items.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="related-title" className="mt-16 border-t border-border pt-10">
      <h2 id="related-title" className="text-24 font-semibold tracking-tight sm:text-32">
        Читайте также
      </h2>
      <div className="mt-6">
        {isPending ? <ArticleGridSkeleton count={3} /> : <ArticleGrid articles={items} />}
      </div>
    </section>
  )
}

export function BlogArticlePage() {
  const { slug = '' } = useParams()
  const { data: article, isPending, isError } = useArticle(slug)

  useDocumentMeta(
    article == null ? undefined : `${article.title} — Блог DreamRig`,
    article?.excerpt,
  )

  if (isPending) {
    return (
      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <ArticlePageSkeleton />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-24 font-semibold tracking-tight">Не удалось загрузить статью</h1>
        <Button asChild>
          <Link to="/blog">Вернуться в блог</Link>
        </Button>
      </section>
    )
  }

  if (article === null) {
    return <Navigate to="/404" replace />
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <nav aria-label="Хлебные крошки" className="text-12 text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground focus-visible:outline-none">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/blog" className="hover:text-foreground focus-visible:outline-none">
                Блог
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={`/blog?rubric=${article.rubric}`}
                className="hover:text-foreground focus-visible:outline-none"
              >
                {ARTICLE_RUBRIC_LABELS[article.rubric]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-60 truncate text-foreground">
              {article.title}
            </li>
          </ol>
        </nav>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-12 font-medium text-accent">
              {ARTICLE_RUBRIC_LABELS[article.rubric]}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-12 tabular-nums text-muted">
              <CalendarDays aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
              {formatArticleDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-12 tabular-nums text-muted">
              <Clock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
              {article.readingMinutes} мин чтения
            </span>
          </div>

          <h1 className="text-32 font-semibold leading-tight tracking-tight sm:text-40">
            {article.title}
          </h1>

          <p className="max-w-3xl text-20 leading-relaxed text-muted">{article.excerpt}</p>

          <div className="mt-2 flex items-center gap-3 border-y border-border py-4">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-14 font-semibold"
            >
              {getInitials(article.author)}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate text-14 font-medium">{article.author}</p>
              <p className="flex items-center gap-1.5 truncate text-12 text-muted">
                <UserRound aria-hidden="true" strokeWidth={1.75} className="size-3" />
                {article.authorRole}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card bg-surface-2">
          <img
            src={assetUrl(article.coverPath)}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <ArticleBody body={article.body} />
        </div>

        <div className={cn('mt-12')}>
          <Button asChild variant="ghost">
            <Link to="/blog">← Назад к блогу</Link>
          </Button>
        </div>

        <RelatedArticles article={article} />
      </div>
    </section>
  )
}
