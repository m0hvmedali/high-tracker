import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function QuizBuilder() {
  const { lessonId } = useParams()
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: quiz } = await supabase.from('quizzes').select('id').eq('lesson_id', lessonId).maybeSingle()
      if (quiz) setQuizId((quiz as any).id)
      const { data: qs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', (quiz as any)?.id)
      setQuestions(qs ?? [])
    }
    load()
  }, [lessonId])

  async function ensureQuiz() {
    if (quizId) return quizId
    const { data } = await supabase.from('quizzes').insert({ lesson_id: lessonId, settings: {} }).select().single()
    setQuizId((data as any).id)
    return (data as any).id as string
  }

  async function addQuestion() {
    const qid = await ensureQuiz()
    const { data } = await supabase.from('quiz_questions').insert({ quiz_id: qid, type: 'mcq', question: '', options: [], answer: null, order_int: (questions.length + 1) }).select().single()
    setQuestions([...(questions as any), data])
  }

  async function saveQuestion(idx: number, q: any) {
    const { data } = await supabase.from('quiz_questions').upsert(q).select().single()
    const next = [...questions]
    next[idx] = data
    setQuestions(next)
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quiz Builder</h1>
          <Link className="underline" to="/teacher">Back</Link>
        </div>
        <Button onClick={addQuestion}>Add question</Button>
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded p-3 space-y-2">
              <div className="text-sm text-muted-foreground">Question #{idx + 1}</div>
              <Input value={q.question ?? ''} onChange={(e) => saveQuestion(idx, { ...q, question: e.target.value })} placeholder="Question text" />
              <Textarea value={q.explanation ?? ''} onChange={(e) => saveQuestion(idx, { ...q, explanation: e.target.value })} placeholder="Explanation (optional)" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
