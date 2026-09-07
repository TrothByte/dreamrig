import { cn } from '@/shared/lib'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']

interface ArticleGridSkeletonProps {
  count?: number
  className?: string
}

export function ArticleGridSkeleton({ count = 6, className }: ArticleGridSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}
    >
      {SKELETON_KEYS.slice(0, count).map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="overflow-hidden rounded-card border border-border bg-surface"
        >
          <div className="skeleton aspect-[16/10]" />
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-4 w-20 rounded-full" />
            </div>
            <div className="skeleton h-5 w-full rounded-md" />
            <div className="skeleton h-5 w-2/3 rounded-md" />
            <div className="skeleton mt-1 h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-1/2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
