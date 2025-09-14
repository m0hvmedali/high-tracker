import { useParams } from 'react-router-dom'

export default function Quiz() {
  const { lessonId } = useParams()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Quiz for lesson {lessonId}</h1>
      <p className="text-muted-foreground">Placeholder — quiz engine with multiple types will render here.</p>
    </div>
  )
}
