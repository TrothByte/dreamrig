import { Moon, ShoppingCart, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useTheme } from '@/app/theme-provider'
import { Button } from '@/shared/ui'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-btn px-3 py-2 text-14 font-medium',
    isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' ')

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="DreamRig — на главную"
          className="font-semibold tracking-tight text-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-btn"
        >
          DreamRig
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" end className={navItemClass}>
            Главная
          </NavLink>
          <NavLink to="/catalog" className={navItemClass}>
            Каталог
          </NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
          >
            {isLight ? <Moon /> : <Sun />}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Корзина">
            <Link to="/cart">
              <ShoppingCart />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
