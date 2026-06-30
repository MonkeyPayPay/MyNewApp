import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useCircle } from './hooks/useCircle'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './components/dashboard/Dashboard'

function AppRouter() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { circle, loading: circleLoading } = useCircle()
  const [showAuth, setShowAuth] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  if (authLoading || (user && circleLoading)) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in — show landing or auth page
  if (!user) {
    if (showAuth) return <Auth />
    return <Landing onGetStarted={() => setShowAuth(true)} />
  }

  // Logged in but no circle yet — onboarding
  if (!circle && !onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />
  }

  // Fully set up — dashboard
  return <Dashboard onLogout={signOut} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
