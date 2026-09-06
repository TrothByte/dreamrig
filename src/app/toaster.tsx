import { Toaster } from 'sonner'
import { useTheme } from './theme-provider'

export function AppToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      toastOptions={{
        classNames: {
          toast: '!border-border !bg-surface !text-foreground',
          description: '!text-muted',
        },
      }}
    />
  )
}
