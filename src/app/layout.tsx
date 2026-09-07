import { motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { ScrollManager } from '@/app/scroll-manager'
import { AppToaster } from '@/app/toaster'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'

export function AppLayout() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <ScrollManager />
      <main className="flex flex-1 flex-col">
        <motion.div
          key={location.pathname}
          className="flex flex-1 flex-col"
          initial={reducedMotion === true ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <AppToaster />
    </div>
  )
}
