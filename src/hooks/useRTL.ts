import { useEffect } from 'react'
import { useSettings } from '@/stores/settings'

export function useRTL() {
  const locale = useSettings((s) => s.locale)
  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])
}
