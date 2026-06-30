import { useState } from 'react'
import Landing from './pages/Landing'
import Dashboard from './components/dashboard/Dashboard'

export default function App() {
  const [view, setView] = useState('landing')

  if (view === 'dashboard') {
    return <Dashboard onLogout={() => setView('landing')} />
  }

  return <Landing onGetStarted={() => setView('dashboard')} />
}
