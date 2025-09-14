export function PDFList({ lessonId }: { lessonId: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">PDFs</div>
      <ul className="space-y-2">
        {[1,2].map((i) => (
          <li key={i} className="flex items-center justify-between">
            <span>PDF {i}</span>
            <button className="text-primary underline">Open</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
