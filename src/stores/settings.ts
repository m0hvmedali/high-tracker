import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

export type ThemeTokens = {
  primary: string
  secondary: string
  accent: string
}

export type Accessibility = {
  fontSize: number
  reducedMotion: boolean
  spacingScale: number
  ttsEnabled: boolean
  captionsDefault: boolean
}

export type SettingsState = {
  theme: ThemeMode
  tokens: ThemeTokens
  accessibility: Accessibility
  locale: 'ar' | 'en'
  setTheme: (theme: ThemeMode) => void
  setLocale: (locale: 'ar' | 'en') => void
  setTokens: (tokens: Partial<ThemeTokens>) => void
  setAccessibility: (a: Partial<Accessibility>) => void
  reset: () => void
}

const defaultState: Omit<SettingsState, 'setTheme' | 'setTokens' | 'setAccessibility' | 'reset' | 'setLocale'> = {
  theme: 'light',
  tokens: {
    primary: '#059669',
    secondary: '#D97706',
    accent: '#0891B2',
  },
  accessibility: {
    fontSize: 100,
    reducedMotion: false,
    spacingScale: 100,
    ttsEnabled: false,
    captionsDefault: true,
  },
  locale: 'ar',
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setTokens: (tokens) => set({ tokens: { ...get().tokens, ...tokens } }),
      setAccessibility: (a) => set({ accessibility: { ...get().accessibility, ...a } }),
      reset: () => set(defaultState),
    }),
    { name: 'settings' }
  )
)
