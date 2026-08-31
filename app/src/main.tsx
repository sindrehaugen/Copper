import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppShell } from './shell'
import './locales/i18n'
import './theme/theme.css'
import '@xyflow/react/dist/style.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <AppShell />
    </StrictMode>
  )
}

