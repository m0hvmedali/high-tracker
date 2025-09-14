import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'

export function LessonHeader({ lessonId }: { lessonId: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3">
      <div>
        <h2 className="text-xl font-semibold">Lesson {lessonId}</h2>
        <div className="text-sm text-muted-foreground">Progress: 0%</div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">Save</Button>
        <Button variant="outline" size="sm">Share</Button>
        <Button variant="ghost" size="icon" aria-label="Bookmark">
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
