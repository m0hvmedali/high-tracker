import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'
import { useSettingsStore } from './settings.store'

interface QueueItem {
  table: 'progress' | 'notes' | 'quiz_attempts'
  payload: any
}

interface SyncState {
  queue: QueueItem[]
  enqueue: (item: QueueItem) => void
  flush: () => Promise<void>
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      enqueue: (item) => set({ queue: [...get().queue, item] }),
      flush: async () => {
        if (!useSettingsStore.getState().online) return
        const q = [...get().queue]
        const rest: QueueItem[] = []
        for (const item of q) {
          const { error } = await supabase.from(item.table).upsert(item.payload)
          if (error) {
            rest.push(item)
          }
        }
        set({ queue: rest })
      },
    }),
    { name: 'sync-store' }
  )
)

export function startSyncLoop() {
  setInterval(() => {
    useSyncStore.getState().flush()
  }, 5000)
}
