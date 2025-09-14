import { supabase } from './SupabaseService'
import { db, type Note, type Progress as ProgressLocal, type AttemptLocal } from './IndexedDBService'

function isNewer(a?: number, b?: number) {
  return (a || 0) > (b || 0)
}

export const SupabaseSyncService = {
  async getUserId() {
    const { data } = await supabase.auth.getUser()
    return data.user?.id || null
  },

  async syncAll() {
    const userId = await this.getUserId()
    if (!userId) return
    await Promise.all([
      this.syncNotes(userId),
      this.syncProgress(userId),
      this.syncAttempts(userId),
    ])
  },

  async syncNotes(userId: string) {
    const local = await db.notes.toArray()
    const { data: remote, error } = await supabase
      .from('notes')
      .select('id, lesson_id, content, bookmark_ts, updated_at')
      .eq('user_id', userId)
    if (error) return

    const map = new Map<string, any>()
    for (const r of remote || []) map.set(r.id, r)

    const merged: Note[] = []
    for (const n of local) {
      const r = map.get(n.id)
      if (!r) {
        merged.push(n)
      } else {
        const rUpdated = r.updated_at ? new Date(r.updated_at).getTime() : 0
        merged.push(isNewer(n.updatedAt, rUpdated)
          ? n
          : { id: r.id, lessonId: r.lesson_id, content: r.content || '', bookmarkTs: r.bookmark_ts || undefined, updatedAt: rUpdated })
        map.delete(n.id)
      }
    }
    for (const r of map.values()) {
      const rUpdated = r.updated_at ? new Date(r.updated_at).getTime() : 0
      merged.push({ id: r.id, lessonId: r.lesson_id, content: r.content || '', bookmarkTs: r.bookmark_ts || undefined, updatedAt: rUpdated })
    }

    await db.transaction('rw', db.notes, async () => {
      await db.notes.clear()
      await db.notes.bulkAdd(merged)
    })

    const payload = merged.map((n) => ({
      id: n.id,
      user_id: userId,
      lesson_id: n.lessonId,
      content: n.content,
      bookmark_ts: n.bookmarkTs ?? null,
      updated_at: new Date(n.updatedAt).toISOString(),
    }))
    await supabase.from('notes').upsert(payload)
  },

  async syncProgress(userId: string) {
    const local = await db.progress.toArray()
    const { data: remote, error } = await supabase
      .from('progress')
      .select('id, lesson_id, video_ts, audio_ts, completed, last_seen')
      .eq('user_id', userId)
    if (error) return

    const byId = new Map<string, any>()
    for (const r of remote || []) byId.set(r.id, r)

    const merged: ProgressLocal[] = []
    for (const p of local) {
      const r = byId.get(p.id)
      if (!r) merged.push(p)
      else {
        const rSeen = r.last_seen ? new Date(r.last_seen).getTime() : 0
        merged.push(isNewer(p.lastSeen, rSeen)
          ? p
          : { id: r.id, lessonId: r.lesson_id, videoTs: r.video_ts ?? undefined, audioTs: r.audio_ts ?? undefined, completed: !!r.completed, lastSeen: rSeen })
        byId.delete(p.id)
      }
    }
    for (const r of byId.values()) {
      const rSeen = r.last_seen ? new Date(r.last_seen).getTime() : 0
      merged.push({ id: r.id, lessonId: r.lesson_id, videoTs: r.video_ts ?? undefined, audioTs: r.audio_ts ?? undefined, completed: !!r.completed, lastSeen: rSeen })
    }

    await db.transaction('rw', db.progress, async () => {
      await db.progress.clear()
      await db.progress.bulkAdd(merged)
    })

    const payload = merged.map((p) => ({
      id: p.id,
      user_id: userId,
      lesson_id: p.lessonId,
      video_ts: p.videoTs ?? null,
      audio_ts: p.audioTs ?? null,
      completed: !!p.completed,
      last_seen: new Date(p.lastSeen).toISOString(),
    }))
    await supabase.from('progress').upsert(payload)
  },

  async syncAttempts(userId: string) {
    const local = await db.attempts.toArray()
    const { data: remote, error } = await supabase
      .from('attempts')
      .select('id, quiz_id, score, details, started_at, finished_at')
      .eq('user_id', userId)
    if (error) return

    const byId = new Map<string, any>()
    for (const r of remote || []) byId.set(r.id, r)

    const merged: AttemptLocal[] = []
    for (const a of local) {
      const r = byId.get(a.id)
      if (!r) merged.push({ ...a, userId })
      else {
        const tLocal = a.finishedAt || a.startedAt
        const tRemote = (r.finished_at ? new Date(r.finished_at).getTime() : 0) || (r.started_at ? new Date(r.started_at).getTime() : 0)
        merged.push(isNewer(tLocal, tRemote)
          ? { ...a, userId }
          : {
              id: r.id,
              quizId: r.quiz_id,
              userId,
              score: r.score ?? undefined,
              details: r.details ?? undefined,
              startedAt: r.started_at ? new Date(r.started_at).getTime() : 0,
              finishedAt: r.finished_at ? new Date(r.finished_at).getTime() : undefined,
            })
        byId.delete(a.id)
      }
    }
    for (const r of byId.values()) {
      merged.push({
        id: r.id,
        quizId: r.quiz_id,
        userId,
        score: r.score ?? undefined,
        details: r.details ?? undefined,
        startedAt: r.started_at ? new Date(r.started_at).getTime() : 0,
        finishedAt: r.finished_at ? new Date(r.finished_at).getTime() : undefined,
      })
    }

    await db.transaction('rw', db.attempts, async () => {
      await db.attempts.clear()
      await db.attempts.bulkAdd(merged)
    })

    const payload = merged.map((a) => ({
      id: a.id,
      user_id: userId,
      quiz_id: a.quizId,
      score: a.score ?? null,
      details: a.details ?? null,
      started_at: new Date(a.startedAt).toISOString(),
      finished_at: a.finishedAt ? new Date(a.finishedAt).toISOString() : null,
    }))
    await supabase.from('attempts').upsert(payload)
  },
}
