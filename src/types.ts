export type UUID = string

export type Role = 'student' | 'teacher' | 'admin'

export interface Profile {
  id: UUID
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Subject {
  id: UUID
  title: string
  description: string | null
  cover_url: string | null
  owner: UUID | null
  is_published: boolean
  created_at: string
}

export interface Section {
  id: UUID
  subject_id: UUID
  title: string
  description: string | null
  order_int: number
}

export interface Lesson {
  id: UUID
  section_id: UUID
  title: string
  description: string | null
  duration: number | null
  tags: string[] | null
  is_published: boolean
  owner: UUID | null
  transcript: any
  created_at: string
}

export type MediaKind = 'diagram' | 'audio' | 'video' | 'pdf'
export interface MediaAsset {
  id: UUID
  lesson_id: UUID
  kind: MediaKind
  title: string
  storage_path: string
  meta: any
  order_int: number
}

export interface Quiz {
  id: UUID
  lesson_id: UUID
  settings: any
}

export interface QuizQuestion {
  id: UUID
  quiz_id: UUID
  type: string
  question: string
  options: any
  answer: any
  explanation: string | null
  order_int: number
}

export interface QuizAttempt {
  id: UUID
  quiz_id: UUID
  user_id: UUID
  started_at: string
  finished_at: string | null
  score: number | null
  answers: any
}

export interface Progress {
  id: UUID
  lesson_id: UUID
  user_id: UUID
  completed: boolean
  watch_seconds: number
  last_video_pos: number
  updated_at: string
}

export interface Note {
  id: UUID
  lesson_id: UUID
  user_id: UUID
  content: string | null
  bookmarks: any
  updated_at: string
}

export interface Share {
  id: UUID
  resource_type: 'subject' | 'section' | 'lesson'
  resource_id: UUID
  created_by: UUID
  token: string
  expires_at: string | null
  password_hash: string | null
  scopes: string[] | null
  created_at: string
}
