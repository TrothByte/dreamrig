import { Check } from 'lucide-react'
import { cn } from '@/shared/lib'

const STEPS = ['Контакты', 'Доставка', 'Подтверждение']

interface CheckoutStepsProps {
  current: number
  className?: string
}

export function CheckoutSteps({ current, className }: CheckoutStepsProps) {
  return (
    <ol aria-label="Шаги оформления заказа" className={cn('flex items-center gap-2', className)}>
      {STEPS.map((step, index) => {
        const stepNumber = index + 1
        const done = stepNumber < current
        const active = stepNumber === current
        return (
          <li key={step} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-12 transition-colors duration-200',
                  done && 'border-accent bg-accent text-accent-fg',
                  active && 'border-accent text-accent',
                  !done && !active && 'border-border text-muted',
                )}
              >
                {done ? (
                  <Check aria-hidden="true" strokeWidth={2} className="size-4" />
                ) : (
                  stepNumber
                )}
              </span>
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'truncate text-14 font-medium',
                  active ? 'text-foreground' : 'text-muted',
                )}
              >
                {step}
              </span>
            </div>
            {stepNumber < STEPS.length && (
              <span
                aria-hidden="true"
                className={cn(
                  'ml-3.5 h-0.5 -translate-y-1 rounded-full transition-colors duration-200',
                  done ? 'bg-accent' : 'bg-surface-2',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
