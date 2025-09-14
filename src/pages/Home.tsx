import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Home() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('subjects')}</h1>
      <p className="text-muted-foreground">Placeholder — subjects grid and search will appear here.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map((i) => (
          <Link key={i} to={`/subject/${i}`} className="rounded-lg border p-4 hover:bg-accent/5">Subject {i}</Link>
        ))}
      </div>
    </div>
  )
}
