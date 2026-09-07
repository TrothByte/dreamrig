import { BookOpen, Newspaper } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useArticles } from '@/entities/article'
import { ARTICLE_RUBRIC_LABELS, ARTICLE_RUBRIC_ORDER, cn, useDocumentMeta } from '@/shared/lib'
import type { ArticleRubric } from '@/shared/model'
import { Button } from '@/shared/ui'
import { ArticleGrid, ArticleGridSkeleton } from '@/widgets/blog-grid'

const PAGE_STEP = 6

const RUBRIC_FILTERS: Array<{ value?: ArticleRubric; label: string }> = [
  { label: 'Все статьи' },
  ...ARTICLE_RUBRIC_ORDER.map((rubric) => ({
    value: rubric,
    label: ARTICLE_RUBRIC_LABELS[rubric],
  })),
]

function rubricFromParams(value: string | null): ArticleRubric | undefined {
  return ARTICLE_RUBRIC_ORDER.includes(value as ArticleRubric)
    ? (value as ArticleRubric)
    : undefined
}

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rubric = rubricFromParams(searchParams.get('rubric'))
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP)

  const { data, isPending, isPlaceholderData, isError, refetch } = useArticles({
    rubric,
    pageSize: visibleCount,
  })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const [activeRubric, setActiveRubric] = useState(rubric)
  if (activeRubric !== rubric) {
    setActiveRubric(rubric)
    setVisibleCount(PAGE_STEP)
  }

  useDocumentMeta(
    'Блог — новости, обзоры и гайды | DreamRig',
    'Новости из мира железа, обзоры компонентов и гайды по сборке ПК от команды DreamRig.',
  )

  const handleRubricChange = (next?: ArticleRubric) => {
    if (next === undefined) {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ rubric: next }, { replace: true })
    }
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <nav aria-label="Хлебные крошки" className="text-12 text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground focus-visible:outline-none">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Блог
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-col gap-2">
          <h1 className="text-32 font-semibold leading-tight tracking-tight sm:text-40">Блог</h1>
          <p className="max-w-2xl text-16 leading-relaxed text-muted">
            Новости из мира железа, честные обзоры и практичные гайды. Разбираемся в технологиях,
            чтобы вы собирали ПК осознанно.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex flex-wrap items-center gap-1 rounded-btn border border-border bg-surface p-1">
            <legend className="sr-only">Рубрики блога</legend>
            {RUBRIC_FILTERS.map((filter) => {
              const active = filter.value === rubric
              return (
                <button
                  key={filter.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleRubricChange(filter.value)}
                  className={cn(
                    'rounded-btn px-3 py-1.5 text-14 font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    active ? 'bg-accent text-accent-fg' : 'text-muted hover:text-foreground',
                  )}
                >
                  {filter.label}
                </button>
              )
            })}
          </fieldset>

          <p className="text-14 text-muted">
            Найдено:{' '}
            <span className="font-mono tabular-nums text-foreground">
              {isPending ? '…' : total}
            </span>{' '}
            {rubric === undefined ? 'материалов' : ARTICLE_RUBRIC_LABELS[rubric].toLowerCase()}
          </p>
        </div>

        <div className="mt-8">
          {isPending ? (
            <ArticleGridSkeleton count={6} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface"
              >
                <Newspaper strokeWidth={1.5} className="size-7 text-muted" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-20 font-semibold tracking-tight sm:text-24">
                  Не удалось загрузить статьи
                </h2>
                <p className="max-w-md text-14 text-muted">
                  Проверьте соединение и попробуйте ещё раз.
                </p>
              </div>
              <Button onClick={() => void refetch()}>Повторить</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface"
              >
                <BookOpen strokeWidth={1.5} className="size-7 text-muted" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-20 font-semibold tracking-tight sm:text-24">
                  В этой рубрике пока пусто
                </h2>
                <p className="max-w-md text-14 text-muted">
                  Редакция готовит новые материалы. Загляните в другие рубрики блога.
                </p>
              </div>
              {rubric !== undefined && (
                <Button variant="secondary" onClick={() => handleRubricChange(undefined)}>
                  Все статьи
                </Button>
              )}
            </div>
          ) : (
            <>
              {isPlaceholderData && <p className="sr-only">Загружаем следующие статьи…</p>}
              <ArticleGrid articles={items} />
              {total > items.length && (
                <div className="mt-10 flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setVisibleCount((count) => count + PAGE_STEP)}
                  >
                    Показать ещё
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
