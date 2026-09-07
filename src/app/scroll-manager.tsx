import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

export function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positionsRef = useRef(new Map<string, number>())
  const currentPathRef = useRef(location.pathname)

  useEffect(() => {
    const previousPath = currentPathRef.current
    if (previousPath !== location.pathname) {
      positionsRef.current.set(previousPath, window.scrollY)
    }
    currentPathRef.current = location.pathname

    if (navigationType === 'POP') {
      const saved = positionsRef.current.get(location.pathname) ?? 0
      window.scrollTo({ top: saved, behavior: 'instant' })
    } else if (previousPath !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, navigationType])

  return null
}
