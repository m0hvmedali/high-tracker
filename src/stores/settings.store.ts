import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  online: boolean
  initialized: boolean
  setOnline: (online: boolean) => void
  setInitialized: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      online: true,
      initialized: false,
      setOnline: (online) => set({ online }),
      setInitialized: (v) => set({ initialized: v }),
    }),
    { name: 'settings-store' }
  )
)
