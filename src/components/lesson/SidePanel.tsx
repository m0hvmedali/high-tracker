import { NotesPanel } from './NotesPanel'
import { QuickQuizWidget } from './QuickQuizWidget'

export function SidePanel({ lessonId }: { lessonId: string }) {
  return (
    <aside className="space-y-4">
      <NotesPanel lessonId={lessonId} />
      <QuickQuizWidget lessonId={lessonId} />
    </aside>
  )
}
