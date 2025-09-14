import { create } from 'zustand'
import sample from '@/data/sample-content.json'

export type MediaAsset = { id: string; title: string; src: string; type?: string; captions?: any; thumbnail?: string }
export type Lesson = {
  id: string
  title: string
  description?: string
  duration?: number
  tags?: string[]
  diagrams?: MediaAsset[]
  audios?: MediaAsset[]
  videos?: MediaAsset[]
  pdfs?: MediaAsset[]
  transcript?: string
  quiz?: any[]
}
export type Section = { id: string; title: string; description?: string; lessons: Lesson[] }
export type Subject = { id: string; title: string; description?: string; coverImage?: string; tags?: string[]; sections: Section[] }

export type ContentState = {
  version: string
  subjects: Subject[]
}

export const useContent = create<ContentState>(() => ({
  version: (sample as any).version,
  subjects: (sample as any).subjects,
}))
