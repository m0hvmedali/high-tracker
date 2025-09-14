import { useParams, Link } from 'react-router-dom'
import { LessonHeader } from '@/components/lesson/LessonHeader'
import { MediaColumn } from '@/components/lesson/MediaColumn'
import { SidePanel } from '@/components/lesson/SidePanel'

export default function Lesson() {
  const { lessonId } = useParams()
  return (
    <div className="space-y-4">
      <LessonHeader lessonId={lessonId!} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MediaColumn lessonId={lessonId!} />
        </div>
        <div className="lg:col-span-1">
          <SidePanel lessonId={lessonId!} />
        </div>
      </div>
      <div className="flex gap-3">
        <Link className="underline" to={`/lesson/${lessonId}/media`}>Open media page</Link>
        <Link className="underline" to={`/lesson/${lessonId}/quiz`}>Open quiz page</Link>
      </div>
    </div>
  )
}
