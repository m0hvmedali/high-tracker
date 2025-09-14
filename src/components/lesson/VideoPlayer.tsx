import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export function VideoPlayer({ lessonId }: { lessonId: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const key = `video:${lessonId}:ts`
    const ts = Number(localStorage.getItem(key) || 0)
    if (ref.current && ts > 0) {
      ref.current.currentTime = ts
    }
    const onTime = () => {
      if (ref.current) localStorage.setItem(key, String(ref.current.currentTime))
    }
    ref.current?.addEventListener('timeupdate', onTime)
    return () => ref.current?.removeEventListener('timeupdate', onTime)
  }, [lessonId])

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">Video</div>
      <video ref={ref} className="w-full rounded" controls src="/sample-video.mp4" />
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => { if (!ref.current) return; ref.current.paused ? ref.current.play() : ref.current.pause(); setPlaying(!playing) }}>{playing ? 'Pause' : 'Play'}</Button>
        <Button size="sm" variant="outline" onClick={() => { if (ref.current) ref.current.currentTime = Math.max(0, ref.current.currentTime - 15) }}>-15s</Button>
        <Button size="sm" variant="outline" onClick={() => { if (ref.current) ref.current.currentTime = ref.current.currentTime + 15 }}>+15s</Button>
      </div>
    </div>
  )
}
