import { useEffect, useState } from 'react'
import { useContentStore } from '@/stores/content.store'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabaseClient'

export function Subjects() {
  const { subjects, sections, lessons, syncPublished, loading } = useContentStore()
  const [shared, setShared] = useState<{ resource_type: string; resource_id: string } | null>(null)

  useEffect(() => {
    syncPublished()
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    if (!token) return
    supabase.rpc('verify_share_token', { token }).then(({ data }) => {
      const row = (data as any[] | null)?.[0]
      if (row) setShared({ resource_type: row.resource_type, resource_id: row.resource_id })
    })
  }, [])

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Subjects</h1>
        {shared && (
          <div className="mb-4 text-sm p-2 rounded bg-secondary">Shared link validated for {shared.resource_type} {shared.resource_id.slice(0,8)}</div>
        )}
        {loading && <p>Loading...</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <p className="text-xs mt-2">{sections.filter(sec => sec.subject_id === s.id).length} sections • {lessons.filter(l => sections.some(sec => sec.id === l.section_id && sec.subject_id === s.id)).length} lessons</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
