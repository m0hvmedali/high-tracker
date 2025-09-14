import { useEffect, useMemo, useRef, useState } from 'react'
import { Layout } from '@/components/Layout'
import { useAuthStore } from '@/stores/auth.store'
import { useContentStore } from '@/stores/content.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabaseClient'
import { uploadMedia } from '@/lib/storage'
import type { MediaKind, Lesson, Section, Subject } from '@/types'

export function TeacherConsole() {
  const { profile } = useAuthStore()
  const { subjects, sections, lessons, upsertSubject, upsertSection, upsertLesson } = useContentStore()

  const [newSubjectTitle, setNewSubjectTitle] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [lessonPublished, setLessonPublished] = useState(false)

  const ownedSubjects = useMemo(() => subjects.filter((s) => s.owner === profile?.id), [subjects, profile])
  const subjectSections = useMemo(() => sections.filter((s) => s.subject_id === selectedSubject), [sections, selectedSubject])

  useEffect(() => {
    if (!selectedSubject && ownedSubjects[0]) setSelectedSubject(ownedSubjects[0].id)
  }, [ownedSubjects])

  const createSubject = async () => {
    if (!profile) return
    const s = await upsertSubject({ title: newSubjectTitle, description: '', owner: profile.id })
    if (s) setNewSubjectTitle('')
  }

  const createSection = async () => {
    if (!selectedSubject) return
    const sec = await upsertSection({ title: newSectionTitle, subject_id: selectedSubject, order_int: 0 })
    if (sec) setNewSectionTitle('')
  }

  const createLesson = async () => {
    if (!profile || !selectedSection) return
    await upsertLesson({ title: newLessonTitle, section_id: selectedSection, owner: profile.id, is_published: lessonPublished })
    setNewLessonTitle('')
    setLessonPublished(false)
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Teacher Console</h1>

        <Card>
          <CardHeader><CardTitle>Create Subject</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Title" value={newSubjectTitle} onChange={(e) => setNewSubjectTitle(e.target.value)} />
            <Button onClick={createSubject} disabled={!newSubjectTitle}>Create</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sections & Sharing</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label>Select subject</Label>
            <select className="border px-2 py-1 rounded" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Select…</option>
              {ownedSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Input placeholder="Section title" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} />
              <Button onClick={createSection} disabled={!newSectionTitle || !selectedSubject}>Add section</Button>
            </div>
            <div className="text-sm text-muted-foreground">{subjectSections.length} sections</div>

            <ShareControls subjectId={selectedSubject} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lessons</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label>Section</Label>
            <select className="border px-2 py-1 rounded" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">Select…</option>
              {subjectSections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.title}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Input placeholder="Lesson title" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
              <div className="flex items-center gap-2">
                <Switch checked={lessonPublished} onCheckedChange={setLessonPublished} />
                <span className="text-sm">Published</span>
              </div>
              <Button onClick={createLesson} disabled={!newLessonTitle || !selectedSection}>Add lesson</Button>
            </div>

            <LessonList sectionId={selectedSection} />
          </CardContent>
        </Card>

        <Analytics />
      </div>
    </Layout>
  )
}

function LessonList({ sectionId }: { sectionId: string }) {
  const { lessons } = useContentStore()
  const filtered = lessons.filter((l) => l.section_id === sectionId)
  return (
    <div className="space-y-3">
      {filtered.map((l) => (
        <LessonRow key={l.id} lesson={l} />
      ))}
    </div>
  )
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const kind = kindFromFile(file)
        const storage_path = await uploadMedia(lesson.id, kind, file)
        await supabase.from('media_assets').insert({ lesson_id: lesson.id, kind, title: file.name, storage_path, meta: { size: file.size, type: file.type } })
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{lesson.title}</div>
          <div className="text-xs text-muted-foreground">{lesson.is_published ? 'Published' : 'Draft'}</div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" multiple onChange={onUpload} className="text-sm" />
          <Button variant="outline" size="sm" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload media'}</Button>
        </div>
      </div>
    </div>
  )
}

function kindFromFile(file: File): MediaKind {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type === 'application/pdf') return 'pdf'
  return 'diagram'
}

function ShareControls({ subjectId }: { subjectId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [hours, setHours] = useState(24)
  async function generate() {
    if (!subjectId) return
    const token = crypto.randomUUID().replace(/-/g, '')
    const expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString()
    const { data, error } = await supabase
      .from('shares')
      .insert({ resource_type: 'subject', resource_id: subjectId, token, scopes: ['read'], expires_at })
      .select()
      .single()
    if (error) return
    const url = new URL(window.location.href)
    url.pathname = '/subjects'
    url.searchParams.set('token', token)
    setLink(url.toString())
  }
  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium">Share subject</div>
      <div className="flex items-center gap-2">
        <Input type="number" min={1} value={hours} onChange={(e) => setHours(parseInt(e.target.value || '1'))} className="w-24" />
        <span className="text-sm">hours</span>
        <Button onClick={generate} disabled={!subjectId}>Generate link</Button>
      </div>
      {link && <div className="text-xs break-all">{link}</div>}
    </div>
  )
}

function Analytics() {
  const { profile } = useAuthStore()
  const [rows, setRows] = useState<Array<{ lesson_id: string; attempts: number; avg_score: number | null }>>([])

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data } = await supabase.rpc('teacher_lessons', { uid: profile.id })
      const lessonIds = (data as any[] | null)?.map((x) => x.id) ?? []
      if (lessonIds.length === 0) return setRows([])
      const { data: agg } = await supabase
        .from('quiz_attempts')
        .select('lesson_id:quiz_id(lesson_id), score')
      const map = new Map<string, number[]>()
      ;(agg as any[] | null)?.forEach((row) => {
        const lid = row.lesson_id?.lesson_id
        if (!lid || !lessonIds.includes(lid)) return
        const arr = map.get(lid) ?? []
        arr.push(row.score)
        map.set(lid, arr)
      })
      const out = Array.from(map.entries()).map(([lesson_id, scores]) => ({
        lesson_id,
        attempts: scores.length,
        avg_score: scores.length ? scores.reduce((a, b) => a + (b || 0), 0) / scores.length : null,
      }))
      setRows(out)
    }
    load()
  }, [profile])

  return (
    <Card>
      <CardHeader><CardTitle>Quiz Results</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {rows.map((r) => (
            <div key={r.lesson_id} className="flex gap-4">
              <div className="w-48">Lesson {r.lesson_id.slice(0, 8)}</div>
              <div>{r.attempts} attempts</div>
              <div>Avg score: {r.avg_score?.toFixed(1) ?? '-'}</div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-muted-foreground">No data yet.</div>}
        </div>
      </CardContent>
    </Card>
  )
}
