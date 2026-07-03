import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './index.css'
import './styles/admin.css'
import './styles/components.css'
import './styles/modals.css'
import App from './App.jsx'

// Apply stored theme immediately to prevent flashing
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
