import { useRef } from 'react'
import { Button } from '@/components/ui/button'

export function AudioPlayer({ lessonId }: { lessonId: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">Audio</div>
      <audio ref={audioRef} className="w-full" controls src="/sample-audio.mp3" />
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { if (audioRef.current) audioRef.current.playbackRate = Math.max(0.5, audioRef.current.playbackRate - 0.25) }}>- speed</Button>
        <Button size="sm" variant="outline" onClick={() => { if (audioRef.current) audioRef.current.playbackRate = Math.min(2, audioRef.current.playbackRate + 0.25) }}>+ speed</Button>
        <Button size="sm" variant="outline" onClick={() => { if (audioRef.current) audioRef.current.loop = !audioRef.current.loop }}>{`loop: ${audioRef.current?.loop ? 'on' : 'off'}`}</Button>
      </div>
    </div>
  )
}
