import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuthStore()
  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold">High Tracker</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/subjects" className="hover:underline">Subjects</Link>
            {(role === 'teacher' || role === 'admin') && (
              <Link to="/teacher" className="hover:underline">Teacher Console</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {role && <Badge variant="secondary">{role}</Badge>}
          {user ? (
            <Button size="sm" variant="outline" onClick={() => signOut()}>Sign out</Button>
          ) : (
            <>
              <Link to="/signin"><Button size="sm" variant="outline">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
