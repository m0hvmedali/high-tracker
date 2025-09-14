import { VideoPlayer } from './VideoPlayer'
import { AudioPlayer } from './AudioPlayer'
import { PDFViewer } from './PDFViewer'
import { DiagramCarousel } from './DiagramCarousel'

export function MediaColumn({ lessonId }: { lessonId: string }) {
  return (
    <div className="space-y-4">
      <VideoPlayer lessonId={lessonId} />
      <AudioPlayer lessonId={lessonId} />
      <PDFViewer lessonId={lessonId} />
      <DiagramCarousel lessonId={lessonId} />
    </div>
  )
}
