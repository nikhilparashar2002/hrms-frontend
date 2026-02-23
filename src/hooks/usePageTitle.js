import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – HRMS Lite` : 'HRMS Lite'
    return () => {
      document.title = 'HRMS Lite'
    }
  }, [title])
}
