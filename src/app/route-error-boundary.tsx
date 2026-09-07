import { AlertTriangle, Check, Copy } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

function ErrorFallback({ error }: { error: Error }) {
  const [copied, setCopied] = useState(false)

  useDocumentMeta('Что-то сломалось | DreamRig')

  const handleCopy = async () => {
    const details = `DreamRig: ${error.message}\n\n${error.stack ?? ''}`
    try {
      await navigator.clipboard.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface"
      >
        <AlertTriangle aria-hidden="true" strokeWidth={1.5} className="size-7 text-warn" />
      </span>
      <h1 className="mt-6 text-24 font-semibold tracking-tight sm:text-32">Что-то сломалось</h1>
      <p className="mt-2 max-w-md text-14 leading-relaxed text-muted">
        При загрузке страницы произошла непредвиденная ошибка. Попробуйте вернуться на главную или
        обновить страницу — если проблема повторится, скопируйте текст ошибки и отправьте его в
        поддержку.
      </p>
      <p className="sr-only">Текст ошибки: {error.message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? (
            <>
              <Check aria-hidden="true" strokeWidth={1.75} />
              Скопировано
            </>
          ) : (
            <>
              <Copy aria-hidden="true" strokeWidth={1.75} />
              Скопировать ошибку
            </>
          )}
        </Button>
      </div>
    </section>
  )
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Роут упал:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

export function RouteErrorBoundary({ children }: ErrorBoundaryProps) {
  const location = useLocation()
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>
}
