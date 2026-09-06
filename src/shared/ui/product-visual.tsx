import {
  Box,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Keyboard,
  type LucideIcon,
  MemoryStick,
  Microchip,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib'
import type { Category } from '@/shared/model'

interface VisualMeta {
  icon: LucideIcon
  hue: string
}

const VISUAL_META: Record<Category, VisualMeta> = {
  cpu: { icon: Cpu, hue: '#fbbf24' },
  gpu: { icon: Microchip, hue: '#a3e635' },
  ram: { icon: MemoryStick, hue: '#f472b6' },
  storage: { icon: HardDrive, hue: '#38bdf8' },
  motherboard: { icon: CircuitBoard, hue: '#818cf8' },
  psu: { icon: Zap, hue: '#facc15' },
  cooling: { icon: Fan, hue: '#67e8f9' },
  case: { icon: Box, hue: '#c084fc' },
  peripherals: { icon: Keyboard, hue: '#fb923c' },
}

interface ProductVisualProps {
  category: Category
  className?: string
  iconClassName?: string
}

export function ProductVisual({ category, className, iconClassName }: ProductVisualProps) {
  const meta = VISUAL_META[category]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] items-center justify-center overflow-hidden',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${meta.hue} 18%, var(--surface-2)), var(--surface-2))`,
      }}
    >
      <div aria-hidden="true" className="product-visual-grid absolute inset-0" />
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn('relative size-10 sm:size-12', iconClassName)}
        style={{ color: `color-mix(in srgb, ${meta.hue} 70%, var(--text))` }}
      />
    </div>
  )
}
