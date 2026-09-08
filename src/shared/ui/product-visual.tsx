import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, cn, resolveProductImage } from '@/shared/lib'
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
  slug?: string
  alt?: string
  className?: string
  iconClassName?: string
  meta?: boolean
}

export function ProductVisual({
  category,
  slug,
  alt,
  className,
  iconClassName,
  meta = false,
}: ProductVisualProps) {
  const hue = CATEGORY_HUES[category]
  const Icon = CATEGORY_ICONS[category]
  const imageUrl = slug === undefined ? null : resolveProductImage(slug, category)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (imageUrl === null) {
      setImageFailed(false)
      return
    }
    setImageLoaded(false)
    setImageFailed(false)
  }, [imageUrl])

  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] items-center justify-center overflow-hidden',
        className,
      )}
      style={{
        backgroundColor: 'var(--surface-2)',
        backgroundImage: `radial-gradient(120% 90% at 85% 0%, color-mix(in srgb, ${hue} 16%, transparent) 0%, transparent 55%), linear-gradient(165deg, var(--surface-2) 0%, var(--surface) 100%)`,
      }}
    >
      <div aria-hidden="true" className="product-visual-grid absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.35]"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${hue} 28%, transparent) 0%, transparent 70%)`,
        }}
      />
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className={cn(
          'relative z-10 size-10 transition-opacity duration-300 sm:size-12',
          imageUrl !== null && !imageFailed ? 'opacity-0' : 'opacity-100',
          iconClassName,
        )}
        style={{ color: `color-mix(in srgb, ${hue} 55%, var(--text))` }}
      />

      {imageUrl !== null && !imageFailed && (
        <img
          src={imageUrl}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          className={cn(
            'absolute inset-0 z-[2] h-full w-full object-cover transition-opacity duration-300 ease-out',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {meta && (
        <span className="absolute bottom-2 left-2 z-10 rounded-md border border-border bg-background/45 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
          {CATEGORY_LABELS[category]}
        </span>
      )}
    </div>
  )
}
