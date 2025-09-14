import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/routes'
import { AppProviders } from '@/app/providers/Providers'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
