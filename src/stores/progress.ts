import { create } from 'zustand'

export type ProgressRecord = { lessonId: string; videoTs?: number; audioTs?: number; completed?: boolean; lastSeen: number }

type ProgressState = {
  records: Record<string, ProgressRecord>
  upsert: (p: ProgressRecord) => void
}

export const useProgress = create<ProgressState>((set) => ({
  records: {},
  upsert: (p) => set((s) => ({ records: { ...s.records, [p.lessonId]: p } })),
}))
