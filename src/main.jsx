/**
 * App entry point — mounts React into #root and loads global styles.
 * Routing: App.jsx (includes full API endpoint map — search "BACKEND INTEGRATION").
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
