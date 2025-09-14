import { useParams, Link } from 'react-router-dom'

export default function Section() {
  const { sectionId } = useParams()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Section {sectionId}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="font-medium">Lesson {i}</div>
            <div className="flex gap-2 mt-2">
              <Link to={`/lesson/${i}`} className="text-primary hover:underline">Open</Link>
              <Link to={`/lesson/${i}/media`} className="text-accent hover:underline">Media</Link>
              <Link to={`/lesson/${i}/quiz`} className="text-secondary hover:underline">Quiz</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
