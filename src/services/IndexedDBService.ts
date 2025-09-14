import Dexie, { Table } from 'dexie'

export type Media = { id: string; lessonId: string; type: 'diagram'|'audio'|'video'|'pdf'; url: string; caption?: string; size?: number; updatedAt: number }
export type Note = { id: string; lessonId: string; content: string; bookmarkTs?: number; updatedAt: number }
export type Progress = { id: string; lessonId: string; videoTs?: number; audioTs?: number; completed?: boolean; lastSeen: number }
export type QuizLocal = { id: string; lessonId: string; questions: any; settings: any; updatedAt: number }
export type AttemptLocal = { id: string; quizId: string; userId?: string; score?: number; details?: any; startedAt: number; finishedAt?: number }
export type Annotation = { id: string; pdfId: string; data: any; updatedAt: number }
export type SettingsBundle = { id: string; data: any; updatedAt: number }
export type ContentBundle = { id: string; version: string; data: any; updatedAt: number }

class AppDB extends Dexie {
  media!: Table<Media, string>
  notes!: Table<Note, string>
  progress!: Table<Progress, string>
  quizzes!: Table<QuizLocal, string>
  attempts!: Table<AttemptLocal, string>
  annotations!: Table<Annotation, string>
  settings!: Table<SettingsBundle, string>
  content!: Table<ContentBundle, string>

  constructor() {
    super('high-tracker')
    this.version(1).stores({
      media: 'id, lessonId, type, updatedAt',
      notes: 'id, lessonId, updatedAt',
      progress: 'id, lessonId, lastSeen',
      quizzes: 'id, lessonId, updatedAt',
      attempts: 'id, quizId, startedAt',
      annotations: 'id, pdfId, updatedAt',
      settings: 'id, updatedAt',
      content: 'id, version, updatedAt',
    })
  }
}

export const db = new AppDB()
