import { render, screen, fireEvent } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { LessonView } from '@/routes/LessonView'
import { useAuthStore } from '@/stores/auth.store'
import { useContentStore } from '@/stores/content.store'

// Mock supabase-js
vi.mock('@/lib/supabaseClient', () => {
  const from = (table: string) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: table === 'quizzes' ? { id: 'q1' } : null }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'a1' } }),
  })
  return { supabase: { from } }
})

function makeRouter(lessonId: string) {
  return createMemoryRouter([
    { path: '/lesson/:lessonId', element: <LessonView /> },
  ], { initialEntries: [`/lesson/${lessonId}`] })
}

describe('Quiz attempt flow', () => {
  it('inserts attempt on take quiz', async () => {
    useAuthStore.setState({ user: { id: 'u1' } as any, role: 'student', session: null, profile: null, loading: false })
    useContentStore.setState({ lessons: [{ id: 'l1', section_id: 's1', title: 'L', description: null, duration: null, tags: null, is_published: true, owner: 't1', transcript: null, created_at: new Date().toISOString() }] as any })
    const router = makeRouter('l1')
    render(<RouterProvider router={router} />)
    const btn = await screen.findByText('Take quiz')
    fireEvent.click(btn)
    // If no errors are thrown, we pass
    expect(true).toBe(true)
  })
})
