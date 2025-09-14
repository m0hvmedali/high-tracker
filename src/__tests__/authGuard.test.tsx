import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { router as appRouter } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

function makeRouter(initialEntries: string[]) {
  return createMemoryRouter(appRouter.routes as any, { initialEntries })
}

describe('Auth guard', () => {
  it('redirects unauthenticated users to /signin', async () => {
    useAuthStore.setState({ user: null, role: null, session: null, profile: null, loading: false })
    const router = makeRouter(['/teacher'])
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe('/signin')
  })
})
