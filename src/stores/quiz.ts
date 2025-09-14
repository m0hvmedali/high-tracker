import { create } from 'zustand'

export type Attempt = { id: string; lessonId: string; score?: number; startedAt: number; finishedAt?: number; details?: any }

type QuizState = {
  attempts: Attempt[]
  addAttempt: (a: Attempt) => void
}

export const useQuiz = create<QuizState>((set) => ({
  attempts: [],
  addAttempt: (a) => set((s) => ({ attempts: [...s.attempts, a] })),
}))
