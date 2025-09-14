import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export type Role = 'student' | 'teacher' | 'admin'

interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: Role
}

interface AuthState {
  user: User | null
  role: Role | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      session: null,
      profile: null,
      loading: true,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile, role: profile?.role ?? null, loading: false }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, role: null, session: null, profile: null })
      },
    }),
    { name: 'auth-store' }
  )
)

export async function bootstrapAuth() {
  const { data } = await supabase.auth.getSession()
  useAuthStore.getState().setSession(data.session)

  if (data.session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id,email,display_name,avatar_url,role')
      .eq('id', data.session.user.id)
      .maybeSingle()
    useAuthStore.getState().setProfile(profile as any)
  } else {
    useAuthStore.getState().setProfile(null)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    useAuthStore.getState().setSession(session)
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id,email,display_name,avatar_url,role')
        .eq('id', session.user.id)
        .maybeSingle()
      useAuthStore.getState().setProfile(profile as any)
    } else {
      useAuthStore.getState().setProfile(null)
    }
  })
}
