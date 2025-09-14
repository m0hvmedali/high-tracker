import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { bootstrapAuth } from './stores/auth.store'
import { startSyncLoop } from './stores/sync.store'

function Bootstrapper() {
  useEffect(() => {
    bootstrapAuth()
    startSyncLoop()
  }, [])
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Bootstrapper />
  </StrictMode>,
)
