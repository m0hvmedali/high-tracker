import { useSettings } from '@/stores/settings'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useSettings((s) => s.locale)
  const setLocale = useSettings((s) => s.setLocale)
  return (
    <Button variant="outline" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
      {locale.toUpperCase()}
    </Button>
  )
}
