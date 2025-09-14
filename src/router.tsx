import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store'
import Home from './App'
import { SignIn } from './routes/SignIn'
import { SignUp } from './routes/SignUp'
import { Subjects } from './routes/Subjects'
import { TeacherConsole } from './routes/TeacherConsole'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function RequireRole({ roles, children }: { roles: ('teacher' | 'admin')[]; children: JSX.Element }) {
  const { role, loading } = useAuthStore()
  if (loading) return <div className="p-8">Loading...</div>
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />
  return children
}

import { QuizBuilder } from './routes/QuizBuilder'
import { LessonView } from './routes/LessonView'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/subjects', element: <Subjects /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  {
    path: '/teacher',
    element: (
      <RequireAuth>
        <RequireRole roles={["teacher", "admin"]}>
          <TeacherConsole />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teacher/quiz/:lessonId',
    element: (
      <RequireAuth>
        <RequireRole roles={["teacher", "admin"]}>
          <QuizBuilder />
        </RequireRole>
      </RequireAuth>
    ),
  },
  { path: '/lesson/:lessonId', element: <LessonView /> },
])
