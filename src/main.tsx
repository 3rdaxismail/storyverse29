import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './firebase/AuthContext'

// Build version tracking for deployment verification
const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || 'dev'
const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || new Date().toISOString()

console.log('%c🚀 Storyverse Deployment Info', 'background: #2F3640; color: #FFF; padding: 8px; font-weight: bold; font-size: 14px;')
console.log(`%cVersion: ${BUILD_VERSION}`, 'color: #3498db; font-weight: bold;')
console.log(`%cBuild Time: ${BUILD_TIME}`, 'color: #2ecc71; font-weight: bold;')
console.log(`%cUser Agent: ${navigator.userAgent}`, 'color: #95a5a6;')
console.log('%c' + '='.repeat(60), 'color: #7f8c8d;')

createRoot(document.getElementById('root')!).render(
  // Temporarily disable StrictMode to prevent double-mounting during development
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // </StrictMode>
)
