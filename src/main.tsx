import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BackendProvider } from './backend/BackendContext.tsx'
import { seedDemoUsers } from './backend/authStore.ts'

// Seed demo accounts once on startup
seedDemoUsers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BackendProvider>
      <App />
    </BackendProvider>
  </StrictMode>,
)
