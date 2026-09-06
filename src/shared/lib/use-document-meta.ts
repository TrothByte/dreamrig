import { useEffect } from 'react'

export function useDocumentMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title === undefined) {
      return
    }
    document.title = title
  }, [title])

  useEffect(() => {
    if (description === undefined) {
      return
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta !== null) {
      meta.setAttribute('content', description)
    }
  }, [description])
}
