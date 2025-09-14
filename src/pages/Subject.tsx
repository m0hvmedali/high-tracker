import { useParams, Link } from 'react-router-dom'

export default function Subject() {
  const { subjectId } = useParams()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Subject {subjectId}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3].map((i) => (
          <Link key={i} to={`/section/${i}`} className="rounded-lg border p-4 hover:bg-accent/5">Section {i}</Link>
        ))}
      </div>
    </div>
  )
}
