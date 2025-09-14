import { VideoPlayer } from './VideoPlayer'

export function VideoPlaylist({ lessonId }: { lessonId: string }) {
  return (
    <div className="space-y-3">
      <VideoPlayer lessonId={lessonId} />
      <div className="rounded-lg border p-3">
        <div className="font-medium mb-2">Playlist</div>
        <ul className="space-y-1 text-sm">
          {[1,2,3].map((i) => <li key={i} className="underline text-primary cursor-pointer">Video {i}</li>)}
        </ul>
      </div>
    </div>
  )
}
