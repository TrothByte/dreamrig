import { type KeyboardEvent, type PointerEvent, useCallback, useRef, useState } from 'react'
import { cn } from '@/shared/lib'

interface PriceRangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  onCommit: (value: [number, number]) => void
  className?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function PriceRangeSlider({
  min,
  max,
  step = 500,
  value,
  onChange,
  onCommit,
  className,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<0 | 1 | null>(null)
  const range = Math.max(1, max - min)

  const valueFromClientX = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (rect === undefined) {
        return min
      }
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      const raw = min + ratio * range
      return Math.round(raw / step) * step
    },
    [min, range, step],
  )

  const adjustThumb = useCallback(
    (index: 0 | 1, delta: number) => {
      const next = [...value] as [number, number]
      const updated = clamp(next[index] + delta, min, max)
      if (index === 0 && updated <= next[1]) {
        next[0] = updated
      }
      if (index === 1 && updated >= next[0]) {
        next[1] = updated
      }
      onChange(next)
      onCommit(next)
    },
    [max, min, onChange, onCommit, value],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: 0 | 1) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return
    }
    event.preventDefault()
    const delta = event.key === 'ArrowLeft' ? -step : step
    adjustThumb(index, delta)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, index: 0 | 1) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveIndex(index)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>, index: 0 | 1) => {
    if (activeIndex !== index) {
      return
    }
    const candidate = valueFromClientX(event.clientX)
    const next = [...value] as [number, number]
    if (index === 0) {
      next[0] = Math.min(candidate, next[1])
    } else {
      next[1] = Math.max(candidate, next[0])
    }
    onChange(next)
  }

  const handlePointerUp = () => {
    if (activeIndex !== null) {
      onCommit(value)
    }
    setActiveIndex(null)
  }

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const candidate = valueFromClientX(event.clientX)
    const [lo, hi] = value
    const index: 0 | 1 = Math.abs(candidate - lo) <= Math.abs(candidate - hi) ? 0 : 1
    const next = [...value] as [number, number]
    if (index === 0) {
      next[0] = Math.min(candidate, next[1])
    } else {
      next[1] = Math.max(candidate, next[0])
    }
    onChange(next)
    onCommit(next)
  }

  const leftPercent = ((value[0] - min) / range) * 100
  const rightPercent = ((value[1] - min) / range) * 100

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className="relative h-6 cursor-pointer"
      >
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-surface-2" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        {([0, 1] as const).map((index) => {
          const percent = index === 0 ? leftPercent : rightPercent
          const ariaValue = value[index]
          return (
            <div
              key={index}
              role="slider"
              tabIndex={0}
              aria-label={index === 0 ? 'Минимальная цена' : 'Максимальная цена'}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={ariaValue}
              aria-valuetext={String(ariaValue)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPointerDown={(event) => handlePointerDown(event, index)}
              onPointerMove={(event) => handlePointerMove(event, index)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                'absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-accent bg-background outline-none active:cursor-grabbing',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                activeIndex === index && 'z-10',
              )}
              style={{ left: `${percent}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
