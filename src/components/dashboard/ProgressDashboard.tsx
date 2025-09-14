import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Week 1', hours: 5 },
  { name: 'Week 2', hours: 8 },
  { name: 'Week 3', hours: 3 },
]

export function ProgressDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={42} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Study Hours</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="hours" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
