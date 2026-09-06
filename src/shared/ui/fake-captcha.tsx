import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib'

interface FakeCaptchaProps {
  verified: boolean
  onChange: (verified: boolean) => void
  error?: boolean
}

type CaptchaState = 'idle' | 'verifying' | 'done'

export function FakeCaptcha({ verified, onChange, error }: FakeCaptchaProps) {
  const [state, setState] = useState<CaptchaState>(verified ? 'done' : 'idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (verified) {
      setState('done')
    }
  }, [verified])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const toggle = () => {
    if (state === 'verifying') {
      return
    }
    if (state === 'done') {
      onChange(false)
      setState('idle')
      return
    }
    setState('verifying')
    timerRef.current = setTimeout(() => {
      onChange(true)
      setState('done')
    }, 900)
  }

  return (
    <div className="w-full">
      <button
        type="button"
        aria-pressed={state === 'done'}
        aria-label="Я не робот"
        onClick={toggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-btn border border-border bg-surface px-4 py-3 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          state === 'done' && 'border-accent/60 bg-accent-soft',
          error && state !== 'done' && 'border-danger/60',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded border transition-colors duration-200',
            state === 'done'
              ? 'border-accent bg-accent text-accent-fg'
              : 'border-border bg-background',
          )}
        >
          {state === 'verifying' ? (
            <Loader2 className="size-4 animate-spin text-muted" />
          ) : state === 'done' ? (
            <ShieldCheck className="size-4" />
          ) : null}
        </span>
        <span className="flex flex-col">
          <span className="text-14">Я не робот</span>
          <span className="text-10 uppercase tracking-widest text-muted">
            DreamRig · защита формы
          </span>
        </span>
        {state === 'done' && (
          <RefreshCw aria-hidden="true" strokeWidth={1.75} className="ml-auto size-4 text-muted" />
        )}
      </button>
      {error && state !== 'done' && (
        <p className="mt-2 text-12 text-danger">Подтвердите, что вы не робот</p>
      )}
    </div>
  )
}
