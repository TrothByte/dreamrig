import { cn } from '@/shared/lib'
import type { Category } from '@/shared/model'
import { CATEGORY_ICONS } from './category-icons'

const CATEGORY_HUES: Record<Category, string> = {
  cpu: '#fbbf24',
  gpu: '#a3e635',
  ram: '#f472b6',
  storage: '#38bdf8',
  motherboard: '#818cf8',
  psu: '#facc15',
  cooling: '#67e8f9',
  case: '#c084fc',
  peripherals: '#fb923c',
}

interface ProductVisualProps {
  category: Category
  className?: string
  iconClassName?: string
}

export function ProductVisual({ category, className, iconClassName }: ProductVisualProps) {
  const hue = CATEGORY_HUES[category]
  const Icon = CATEGORY_ICONS[category]

  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] items-center justify-center overflow-hidden',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${hue} 18%, var(--surface-2)), var(--surface-2))`,
      }}
    >
      <div aria-hidden="true" className="product-visual-grid absolute inset-0" />
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn('relative size-10 sm:size-12', iconClassName)}
        style={{ color: `color-mix(in srgb, ${hue} 70%, var(--text))` }}
      />
    </div>
  )
}
