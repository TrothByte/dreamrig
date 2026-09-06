import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib'

interface QtyStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  ariaLabel?: string
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  ariaLabel = 'Количество',
}: QtyStepperProps) {
  const canDecrease = value > min
  const canIncrease = value < max

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-btn border border-border bg-surface-2',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Уменьшить количество"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className="flex size-9 items-center justify-center rounded-l-btn text-muted transition-colors duration-150 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Minus aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </button>
      <output aria-label={ariaLabel} className="min-w-8 text-center font-mono text-14 tabular-nums">
        {value}
      </output>
      <button
        type="button"
        aria-label="Увеличить количество"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className="flex size-9 items-center justify-center rounded-r-btn text-muted transition-colors duration-150 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </button>
    </div>
  )
}
