export function QuickQuizWidget({ lessonId }: { lessonId: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">Quick Quiz</div>
      <div className="text-sm text-muted-foreground">A quick single question will appear here.</div>
    </div>
  )
}
