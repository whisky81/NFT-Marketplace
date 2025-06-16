import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import W3Provider from './providers/W3Provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <W3Provider>
      <App />
    </W3Provider>
  </StrictMode>,
)
