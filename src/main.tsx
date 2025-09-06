import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { securityMonitor, SecurityEventType } from './lib/securityMonitor'

// Initialize security monitoring
securityMonitor.log(SecurityEventType.LOGIN_SUCCESS, 'Application initialized', 'low')

// Add global error handler for security monitoring
window.addEventListener('error', (event) => {
  securityMonitor.log(
    SecurityEventType.INVALID_INPUT,
    `Global error: ${event.message} at ${event.filename}:${event.lineno}`,
    'medium'
  )
})

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  securityMonitor.log(
    SecurityEventType.INVALID_INPUT,
    `Unhandled promise rejection: ${event.reason}`,
    'high'
  )
})

createRoot(document.getElementById("root")!).render(<App />);
