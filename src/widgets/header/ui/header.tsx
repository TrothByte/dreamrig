import { LogOut, Moon, ShoppingCart, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { toast } from 'sonner'
import { useTheme } from '@/app/theme-provider'
import { selectCartTotalQty, useCartStore } from '@/entities/cart'
import { useAuthStore } from '@/entities/user'
import { getAuthRepository } from '@/shared/api'
import { cn } from '@/shared/lib'
import { displayInitials, displayName } from '@/shared/model/auth'
import { Button } from '@/shared/ui'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-10 items-center rounded-btn px-3 text-14 font-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive
      ? 'text-foreground'
      : 'text-muted transition-colors duration-200 hover:text-foreground',
    isActive && 'shadow-[inset_0_-2px_0_0_var(--accent)]',
  )

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const cartQty = useCartStore(selectCartTotalQty)
  const profile = useAuthStore((state) => state.profile)
  const status = useAuthStore((state) => state.status)

  const handleSignOut = async () => {
    try {
      await getAuthRepository().signOut()
      toast.success('Вы вышли из аккаунта')
    } catch {
      toast.error('Не удалось выйти')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="DreamRig — на главную"
          className="flex items-center gap-2.5 rounded-btn font-semibold tracking-tight text-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg border border-accent/30 bg-surface"
          >
            <span className="size-2 rounded-[3px] bg-accent" />
          </span>
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
          {status === 'authed' && profile !== null ? (
            <>
              <span
                title={displayName(profile)}
                className="mr-1 hidden items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 sm:flex"
              >
                <span className="sr-only">Вы вошли как {displayName(profile)}</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft font-mono text-12 font-semibold text-accent">
                  {displayInitials(profile)}
                </span>
                <span className="max-w-32 truncate text-14">{displayName(profile)}</span>
              </span>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Войти (ваш профиль)"
                className="text-muted hover:text-foreground sm:hidden"
              >
                <Link to="/login">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft font-mono text-12 font-semibold text-accent">
                    {profile !== null ? displayInitials(profile) : ''}
                  </span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Выйти из аккаунта"
                onClick={() => void handleSignOut()}
                className="text-muted hover:text-foreground"
              >
                <LogOut aria-hidden="true" strokeWidth={1.75} />
              </Button>
            </>
          ) : status === 'anon' ? (
            <Button asChild variant="ghost" size="sm" className="text-muted hover:text-foreground">
              <Link to="/login">Войти</Link>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
            className="text-muted hover:text-foreground"
          >
            {isLight ? <Moon /> : <Sun />}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Корзина, товаров: ${cartQty}`}
            className="relative text-muted hover:text-foreground"
          >
            <Link to="/cart">
              <ShoppingCart aria-hidden="true" strokeWidth={1.75} />
              {cartQty > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 font-mono text-12 font-semibold leading-none tabular-nums text-accent-fg">
                  {cartQty > 99 ? '99+' : cartQty}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
