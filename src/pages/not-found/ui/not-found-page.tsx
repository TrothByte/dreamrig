import { Link } from 'react-router'
import { useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'

export function NotFoundPage() {
  useDocumentMeta('Страница не найдена | DreamRig')

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="sr-only">Страница не найдена</h1>
      <p className="font-mono text-12 uppercase tracking-[0.3em] text-muted">Ошибка 404</p>

      <div
        aria-hidden="true"
        data-text="404"
        className="glitch-text mt-4 font-mono text-[clamp(5rem,18vw,10rem)] font-bold leading-none tracking-tight text-foreground"
      >
        404
      </div>

      <p className="mt-6 text-20 font-semibold tracking-tight sm:text-24">Такой страницы нет</p>
      <p className="mt-2 max-w-md text-14 leading-relaxed text-muted">
        Возможно, страница переехала, была удалена или вы ошиблись адресом. Попробуйте начать с
        главной или продолжить с каталога.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/catalog">В каталог</Link>
        </Button>
      </div>
    </section>
  )
}
