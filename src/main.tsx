import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import AppRouter from './router'
import { useAuthStore } from './store/authStore'

function Bootstrap() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage)
  useEffect(() => { initFromStorage() }, [initFromStorage])
  return <AppRouter />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </StrictMode>,
)
