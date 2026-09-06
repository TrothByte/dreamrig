import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useCatalogParams } from '@/features/product-filters'
import { CATEGORY_LABELS, CATEGORY_ORDER, cn } from '@/shared/lib'
import type { Category } from '@/shared/model'
import { CATEGORY_ICONS } from '@/shared/ui'

interface CategoryNavProps {
  className?: string
}

export function CategoryNav({ className }: CategoryNavProps) {
  const { params, updateParams } = useCatalogParams()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const dragStateRef = useRef({ startX: 0, scrollLeft: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const scroller = scrollerRef.current
    if (scroller === null) {
      return
    }
    setCanScrollLeft(scroller.scrollLeft > 4)
    setCanScrollRight(scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const scroller = scrollerRef.current
    if (scroller === null) {
      return
    }
    const resizeObserver = new ResizeObserver(updateArrows)
    scroller.addEventListener('scroll', updateArrows, { passive: true })
    resizeObserver.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', updateArrows)
      resizeObserver.disconnect()
    }
  }, [updateArrows])

  const scrollByDirection = (direction: -1 | 1) => {
    const scroller = scrollerRef.current
    if (scroller === null) {
      return
    }
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.75, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isDragging) {
      return
    }
    const scroller = scrollerRef.current
    if (scroller === null) {
      return
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const { startX, scrollLeft } = dragStateRef.current
      const delta = event.clientX - startX
      if (Math.abs(delta) > 6) {
        movedRef.current = true
      }
      scroller.scrollLeft = scrollLeft - delta
    }

    const endDrag = () => {
      draggingRef.current = false
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [isDragging])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (scroller === null || event.button !== 0) {
      return
    }
    draggingRef.current = true
    movedRef.current = false
    dragStateRef.current = { startX: event.clientX, scrollLeft: scroller.scrollLeft }
    setIsDragging(true)
  }

  const selectCategory = (category: Category | undefined) => {
    if (movedRef.current) {
      movedRef.current = false
      return
    }
    updateParams({ category })
  }

  const items: Array<{ key: string; category?: Category }> = [
    { key: 'all' },
    ...CATEGORY_ORDER.map((category) => ({ key: category, category })),
  ]

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      {canScrollLeft && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12"
            style={{ backgroundImage: 'linear-gradient(90deg, var(--surface), transparent)' }}
          />
          <button
            type="button"
            aria-label="Прокрутить категории назад"
            onClick={() => scrollByDirection(-1)}
            className="relative z-20 -ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        onPointerDown={handlePointerDown}
        className={cn(
          'no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain py-1',
          isDragging && 'cursor-grabbing select-none',
        )}
      >
        {items.map((item) => {
          const active = item.category === params.category
          const Icon = item.category === undefined ? LayoutGrid : CATEGORY_ICONS[item.category]
          const label = item.category === undefined ? 'Все' : CATEGORY_LABELS[item.category]
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => selectCategory(item.category)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-14 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active
                  ? 'bg-accent-soft font-medium text-foreground'
                  : 'text-muted hover:bg-surface-2 hover:text-foreground',
              )}
            >
              <Icon
                aria-hidden="true"
                strokeWidth={1.75}
                className={cn('size-4', active && 'text-accent')}
              />
              {label}
            </button>
          )
        })}
      </div>

      {canScrollRight && (
        <>
          <button
            type="button"
            aria-label="Прокрутить категории вперёд"
            onClick={() => scrollByDirection(1)}
            className="relative z-20 -mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </button>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12"
            style={{ backgroundImage: 'linear-gradient(270deg, var(--surface), transparent)' }}
          />
        </>
      )}
    </div>
  )
}
