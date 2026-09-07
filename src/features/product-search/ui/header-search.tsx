import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import { getProductRepository } from '@/shared/api'
import { CATEGORY_LABELS, cn, formatPrice } from '@/shared/lib'
import { ProductVisual } from '@/shared/ui'

const SEARCH_DEBOUNCE_MS = 300
const SUGGESTIONS_LIMIT = 6

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

interface HeaderSearchProps {
  id: string
  className?: string
  onNavigate?: () => void
}

export function HeaderSearch({ id, className, onNavigate }: HeaderSearchProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const listboxId = `${id}-${inputId}`
  const term = value.trim()
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS)
  const searchEnabled = debouncedTerm.length >= 2

  const { data, isFetching } = useQuery({
    queryKey: ['product-search', debouncedTerm],
    queryFn: () =>
      getProductRepository().getProducts({
        search: debouncedTerm,
        sort: 'popular',
        page: 1,
        pageSize: SUGGESTIONS_LIMIT,
      }),
    enabled: searchEnabled,
  })

  const suggestions = data?.items ?? []
  const showListbox = open && searchEnabled

  useEffect(() => {
    if (activeIndex >= suggestions.length) {
      setActiveIndex(-1)
    }
  }, [activeIndex, suggestions.length])

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const goToCatalog = () => {
    const query = term.length === 0 ? '' : `?search=${encodeURIComponent(term)}`
    close()
    setValue('')
    onNavigate?.()
    navigate(`/catalog${query}`)
  }

  const goToProduct = (slug: string) => {
    close()
    setValue('')
    onNavigate?.()
    navigate(`/product/${slug}`)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const activeProduct = suggestions[activeIndex]
    if (activeProduct !== undefined) {
      goToProduct(activeProduct.slug)
      return
    }
    goToCatalog()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showListbox) {
      if (event.key === 'ArrowDown' && searchEnabled) {
        event.preventDefault()
        setOpen(true)
      }
      return
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % suggestions.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(suggestions.length - 1)
        break
      case 'Escape':
        close()
        break
    }
  }

  const handleFocus = () => {
    setOpen(searchEnabled)
  }

  const handleCloseOnBlur = (event: FocusEvent<HTMLElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget)) {
      close()
    }
  }

  const handleClear = () => {
    setValue('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search
          aria-hidden="true"
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          id={listboxId}
          role="combobox"
          type="search"
          autoComplete="off"
          aria-expanded={showListbox}
          aria-controls={showListbox ? `${listboxId}-listbox` : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showListbox && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-label="Поиск по каталогу"
          placeholder="Поиск: RTX 5070, Ryzen…"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setActiveIndex(-1)
            if (searchEnabled) {
              setOpen(true)
            }
          }}
          onFocus={handleFocus}
          onBlur={handleCloseOnBlur}
          onKeyDown={handleKeyDown}
          className="h-10 w-full rounded-btn border border-border bg-surface pl-9 pr-9 text-14 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:hidden"
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label="Очистить поиск"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          </button>
        )}
      </form>

      {showListbox && (
        <div
          id={`${listboxId}-listbox`}
          role="listbox"
          aria-label="Результаты поиска"
          onBlur={handleCloseOnBlur}
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-card border border-border bg-surface shadow-card"
        >
          {isFetching && suggestions.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-3 text-14 text-muted">
              <span aria-hidden="true" className="size-3 animate-pulse rounded-full bg-accent" />
              Ищем по запросу «{debouncedTerm}»…
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-14 text-muted">
              Ничего не найдено по запросу «{debouncedTerm}»
            </p>
          ) : (
            <>
              <ul className="max-h-[26rem] overflow-y-auto scrollbar-thin py-2">
                {suggestions.map((product, index) => {
                  const isActive = index === activeIndex
                  return (
                    <li key={product.id} role="none">
                      <button
                        type="button"
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => goToProduct(product.slug)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left',
                          'transition-colors duration-100 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none',
                          isActive && 'bg-surface-2',
                        )}
                      >
                        <ProductVisual
                          category={product.category}
                          className="size-10 shrink-0 rounded-md"
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-14 font-medium">{product.name}</span>
                          <span className="text-12 text-muted">
                            {CATEGORY_LABELS[product.category]}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-14 font-semibold tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={goToCatalog}
                  className="w-full rounded-btn px-3 py-2 text-left text-14 font-medium text-accent hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                >
                  Показать все результаты по запросу «{debouncedTerm}»
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
