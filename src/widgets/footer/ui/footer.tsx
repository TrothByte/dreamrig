import { Link } from 'react-router'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-14 text-muted sm:flex-row sm:px-6">
        <p className="font-semibold tracking-tight text-foreground">DreamRig</p>
        <nav aria-label="Навигация в подвале" className="flex items-center gap-4">
          <Link
            to="/catalog"
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-btn"
          >
            Каталог
          </Link>
          <Link
            to="/blog"
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-btn"
          >
            Блог
          </Link>
        </nav>
        <p>© 2026 DreamRig</p>
      </div>
    </footer>
  )
}
