import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'
import type { MediaAsset, Section, Subject, Lesson } from '@/types'
import { idb } from '@/lib/idb'

interface ContentState {
  subjects: Subject[]
  sections: Section[]
  lessons: Lesson[]
  media: MediaAsset[]
  loading: boolean
  syncPublished: () => Promise<void>
  upsertSubject: (s: Partial<Subject>) => Promise<Subject | null>
  upsertSection: (s: Partial<Section>) => Promise<Section | null>
  upsertLesson: (l: Partial<Lesson>) => Promise<Lesson | null>
  upsertMedia: (m: Partial<MediaAsset>) => Promise<MediaAsset | null>
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      subjects: [],
      sections: [],
      lessons: [],
      media: [],
      loading: false,
      syncPublished: async () => {
        set({ loading: true })
        try {
          const cached = await idb.get('published-cache')
          if (cached) {
            set(cached)
          }
          const { data: subjects } = await supabase
            .from('subjects')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
          const { data: sections } = await supabase
            .from('sections')
            .select('*')
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('is_published', true)
          const { data: media } = await supabase
            .from('media_assets')
            .select('*')

          const payload = {
            subjects: subjects ?? [],
            sections: sections ?? [],
            lessons: lessons ?? [],
            media: media ?? [],
            loading: false,
          }
          set(payload)
          await idb.set('published-cache', payload)
        } finally {
          set({ loading: false })
        }
      },
      upsertSubject: async (s) => {
        const { data, error } = await supabase.from('subjects').upsert(s).select().single()
        if (error) return null
        const current = get().subjects
        const next = [...current.filter((x) => x.id !== (data as any).id), data as any]
        set({ subjects: next })
        return data as any
      },
      upsertSection: async (s) => {
        const { data, error } = await supabase.from('sections').upsert(s).select().single()
        if (error) return null
        const current = get().sections
        const next = [...current.filter((x) => x.id !== (data as any).id), data as any]
        set({ sections: next })
        return data as any
      },
      upsertLesson: async (l) => {
        const { data, error } = await supabase.from('lessons').upsert(l).select().single()
        if (error) return null
        const current = get().lessons
        const next = [...current.filter((x) => x.id !== (data as any).id), data as any]
        set({ lessons: next })
        return data as any
      },
      upsertMedia: async (m) => {
        const { data, error } = await supabase.from('media_assets').upsert(m).select().single()
        if (error) return null
        const current = get().media
        const next = [...current.filter((x) => x.id !== (data as any).id), data as any]
        set({ media: next })
        return data as any
      },
    }),
    { name: 'content-store' }
  )
)
