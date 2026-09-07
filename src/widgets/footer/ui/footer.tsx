import { Link } from 'react-router'
import { cn } from '@/shared/lib'

const linkClass =
  'w-fit rounded-btn text-14 text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const groupTitleClass = 'text-12 font-medium uppercase tracking-[0.14em] text-muted'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-3">
          <p className="flex items-center gap-2.5 text-20 font-semibold tracking-tight">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-md border border-accent/30 bg-background"
            >
              <span className="size-1.5 rounded-[3px] bg-accent" />
            </span>
            DreamRig
          </p>
          <p className="max-w-xs text-14 leading-relaxed text-muted">
            Компьютерное железо и периферия: честные цены, гарантия и доставка.
          </p>
        </div>

        <nav aria-label="Разделы">
          <h2 className={groupTitleClass}>Разделы</h2>
          <ul className="mt-4 flex flex-col items-start gap-2.5 text-14">
            <li>
              <Link to="/" className={linkClass}>
                Главная
              </Link>
            </li>
            <li>
              <Link to="/catalog" className={linkClass}>
                Каталог
              </Link>
            </li>
            <li>
              <Link to="/blog" className={linkClass}>
                Блог
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Сервис">
          <h2 className={groupTitleClass}>Сервис</h2>
          <ul className="mt-4 flex flex-col items-start gap-2.5 text-14">
            <li>
              <Link to="/favorites" className={linkClass}>
                Избранное
              </Link>
            </li>
            <li>
              <Link to="/cart" className={linkClass}>
                Корзина
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-12 text-muted sm:flex-row sm:px-6">
          <p>© 2026 DreamRig</p>
          <p className={cn('font-mono tracking-[0.14em]')}>TECH RETAIL · MADE FOR BUILDERS</p>
        </div>
      </div>
    </footer>
  )
}
