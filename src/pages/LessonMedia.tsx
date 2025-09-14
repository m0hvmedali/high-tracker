import { useParams } from 'react-router-dom'
import { VideoPlaylist } from '@/components/lesson/VideoPlaylist'
import { PDFList } from '@/components/lesson/PDFList'

export default function LessonMedia() {
  const { lessonId } = useParams()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <VideoPlaylist lessonId={lessonId!} />
      </div>
      <aside className="lg:col-span-1 space-y-4">
        <PDFList lessonId={lessonId!} />
      </aside>
    </div>
  )
}
