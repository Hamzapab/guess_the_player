import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ClerkWrapper from './ClerkWrapper'
import './index.css'







createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <ClerkWrapper />
  </StrictMode>,
)
