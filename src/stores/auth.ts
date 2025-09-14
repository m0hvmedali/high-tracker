import { create } from 'zustand'
import { supabase } from '@/services/SupabaseService'

export type SessionState = {
  user: { id: string; email?: string } | null
  loading: boolean
  signInWithOtp: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export const useAuth = create<SessionState>((set) => ({
  user: null,
  loading: false,
  async signInWithOtp(email) {
    set({ loading: true })
    await supabase.auth.signInWithOtp({ email })
    set({ loading: false })
  },
  async signOut() {
    await supabase.auth.signOut()
    set({ user: null })
  },
  async refresh() {
    const { data } = await supabase.auth.getUser()
    set({ user: data.user ? { id: data.user.id, email: data.user.email || undefined } : null })
  },
}))
