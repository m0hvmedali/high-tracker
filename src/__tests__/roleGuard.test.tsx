import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { router as appRouter } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

function makeRouter(initialEntries: string[]) {
  return createMemoryRouter(appRouter.routes as any, { initialEntries })
}

describe('Role-based gating', () => {
  it('blocks student from teacher console', async () => {
    useAuthStore.setState({
      user: { id: 'u1' } as any,
      role: 'student',
      session: null,
      profile: null,
      loading: false,
    })
    const router = makeRouter(['/teacher'])
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe('/')
  })

  it('allows teacher', async () => {
    useAuthStore.setState({ user: { id: 'u1' } as any, role: 'teacher', session: null, profile: null, loading: false })
    const router = makeRouter(['/teacher'])
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe('/teacher')
  })
})
