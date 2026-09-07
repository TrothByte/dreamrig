import { lazy, type ReactNode, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AppLayout } from '@/app/layout'
import { PageFallback } from '@/app/page-fallback'
import { RouteErrorBoundary } from '@/app/route-error-boundary'

const HomePage = lazy(() => import('@/pages/home').then((module) => ({ default: module.HomePage })))
const CatalogPage = lazy(() =>
  import('@/pages/catalog').then((module) => ({ default: module.CatalogPage })),
)
const ProductPage = lazy(() =>
  import('@/pages/product').then((module) => ({ default: module.ProductPage })),
)
const BlogPage = lazy(() => import('@/pages/blog').then((module) => ({ default: module.BlogPage })))
const BlogArticlePage = lazy(() =>
  import('@/pages/blog-article').then((module) => ({ default: module.BlogArticlePage })),
)
const FavoritesPage = lazy(() =>
  import('@/pages/favorites').then((module) => ({ default: module.FavoritesPage })),
)
const CartPage = lazy(() => import('@/pages/cart').then((module) => ({ default: module.CartPage })))
const CheckoutPage = lazy(() =>
  import('@/pages/checkout').then((module) => ({ default: module.CheckoutPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/login').then((module) => ({ default: module.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/register').then((module) => ({ default: module.RegisterPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({ default: module.NotFoundPage })),
)

function guardedPage(page: ReactNode): ReactNode {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<PageFallback />}>{page}</Suspense>
    </RouteErrorBoundary>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={guardedPage(<HomePage />)} />
        <Route path="/catalog" element={guardedPage(<CatalogPage />)} />
        <Route path="/product/:slug" element={guardedPage(<ProductPage />)} />
        <Route path="/blog" element={guardedPage(<BlogPage />)} />
        <Route path="/blog/:slug" element={guardedPage(<BlogArticlePage />)} />
        <Route path="/favorites" element={guardedPage(<FavoritesPage />)} />
        <Route path="/404" element={guardedPage(<NotFoundPage />)} />
        <Route path="/login" element={guardedPage(<LoginPage />)} />
        <Route path="/register" element={guardedPage(<RegisterPage />)} />
        <Route path="/cart" element={guardedPage(<CartPage />)} />
        <Route path="/checkout" element={guardedPage(<CheckoutPage />)} />
        <Route path="/admin" element={guardedPage(<AdminPage />)} />
        <Route path="*" element={guardedPage(<NotFoundPage />)} />
      </Route>
    </Routes>
  )
}
