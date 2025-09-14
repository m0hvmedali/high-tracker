import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/app/i18n'
import { useRTL } from '@/hooks/useRTL'
import { useThemeTokens } from '@/hooks/useThemeTokens'

export function AppProviders({ children }: PropsWithChildren) {
  useRTL()
  useThemeTokens()
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
