import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function NotesPanel({ lessonId }: { lessonId: string }) {
  const key = `notes:${lessonId}`
  const [content, setContent] = useState('')

  useEffect(() => {
    setContent(localStorage.getItem(key) || '')
  }, [key])

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">Notes</div>
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes…" />
      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={() => localStorage.setItem(key, content)}>Save</Button>
      </div>
    </div>
  )
}
