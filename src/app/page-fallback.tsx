export function PageFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-28">
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-border border-t-accent"
      />
      <p className="sr-only">Загрузка страницы…</p>
    </div>
  )
}
