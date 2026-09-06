import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { QueryProvider } from '@/app/query-provider'
import { AppRouter } from '@/app/router'
import { ThemeProvider } from '@/app/theme-provider'
import { getApiMode } from '@/shared/config'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Корневой элемент #root не найден')
}

async function enableMocking(): Promise<void> {
  if (getApiMode() !== 'mock') {
    return
  }
  const { worker } = await import('@/shared/api/mock/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <QueryProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </QueryProvider>
      </ThemeProvider>
    </StrictMode>,
  )
})
