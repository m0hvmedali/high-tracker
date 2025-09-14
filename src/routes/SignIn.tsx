import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'
import { Link, useNavigate } from 'react-router-dom'

export function SignIn() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMessage(error.message)
    setSession(data.session)
    navigate('/')
  }

  const onMagicLink = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) return setMessage(error.message)
    setMessage('Magic link sent. Check your email.')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
      <form onSubmit={onSignIn} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>Sign In</Button>
          <Button type="button" variant="outline" onClick={onMagicLink} disabled={!email || loading}>
            Send magic link
          </Button>
        </div>
      </form>
      <p className="mt-4 text-sm">
        Need an account? <Link className="underline" to="/signup">Sign up</Link>
      </p>
    </div>
  )
}
