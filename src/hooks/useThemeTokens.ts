import { useEffect } from 'react'
import { useSettings } from '@/stores/settings'

export function useThemeTokens() {
  const { theme, tokens, accessibility } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.setProperty('--primary', tokens.primary)
    root.style.setProperty('--secondary', tokens.secondary)
    root.style.setProperty('--accent', tokens.accent)

    const fontScale = Math.max(80, Math.min(150, accessibility.fontSize)) / 100
    root.style.setProperty('--font-scale', String(fontScale))
    document.body.style.fontSize = `${fontScale}em`

    if (accessibility.reducedMotion) {
      root.style.setProperty('prefers-reduced-motion', 'reduce')
      document.documentElement.classList.add('motion-safe')
    } else {
      root.style.removeProperty('prefers-reduced-motion')
      document.documentElement.classList.remove('motion-safe')
    }
  }, [theme, tokens.primary, tokens.secondary, tokens.accent, accessibility.fontSize, accessibility.reducedMotion])
}
