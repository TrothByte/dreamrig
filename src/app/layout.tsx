import { Outlet } from 'react-router'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
