import { useEffect } from 'react'
import { supabase } from '@/services/SupabaseService'
import { SupabaseSyncService } from '@/services/SupabaseSyncService'

export function AuthListener() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await SupabaseSyncService.syncAll()
      }
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])
  return null
}
