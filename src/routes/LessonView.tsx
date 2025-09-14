import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { useContentStore } from '@/stores/content.store'
import { useAuthStore } from '@/stores/auth.store'
import { useSyncStore } from '@/stores/sync.store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'

export function LessonView() {
  const { lessonId } = useParams()
  const { lessons, syncPublished } = useContentStore()
  const { user } = useAuthStore()
  const { enqueue } = useSyncStore()
  const [notes, setNotes] = useState('')
  const [completed, setCompleted] = useState(false)
  const lesson = lessons.find((l) => l.id === lessonId)

  useEffect(() => {
    if (!lesson) syncPublished()
  }, [lesson])

  async function saveProgress() {
    if (!user || !lessonId) return
    enqueue({ table: 'progress', payload: { lesson_id: lessonId, user_id: user.id, completed } })
  }

  async function saveNotes() {
    if (!user || !lessonId) return
    enqueue({ table: 'notes', payload: { lesson_id: lessonId, user_id: user.id, content: notes } })
  }

  async function takeQuiz() {
    if (!user || !lessonId) return
    const { data: quiz } = await supabase.from('quizzes').select('id').eq('lesson_id', lessonId).maybeSingle()
    if (!quiz) return
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .insert({ quiz_id: (quiz as any).id, user_id: user.id, answers: {} })
      .select()
      .single()
    console.log('started attempt', attempt)
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{lesson?.title ?? 'Lesson'}</h1>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
            Mark complete
          </label>
          <Button size="sm" onClick={saveProgress}>Save</Button>
        </div>
        <div>
          <div className="text-sm mb-1">Notes</div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Your notes..." />
          <div className="mt-2">
            <Button size="sm" onClick={saveNotes}>Save notes</Button>
          </div>
        </div>
        <div>
          <Button onClick={takeQuiz}>Take quiz</Button>
        </div>
      </div>
    </Layout>
  )
}
