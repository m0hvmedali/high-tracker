import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export function Header() {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        <Link to="/" className="font-semibold text-primary">{t('appName')}</Link>
        <nav className="ml-auto flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/search?q=${encodeURIComponent(q)}`)
            }}
            className="hidden md:flex items-center gap-2"
          >
            <Input
              placeholder={t('search') as string}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="secondary">{t('search')}</Button>
          </form>
          <Link to="/dashboard"><Button variant="ghost">{t('dashboard')}</Button></Link>
          <Link to="/settings"><Button variant="ghost">{t('settings')}</Button></Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  )
}
