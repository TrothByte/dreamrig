import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { AppRouter } from '@/app/router'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Корневой элемент #root не найден')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
