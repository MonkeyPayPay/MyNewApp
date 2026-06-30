import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useCircle } from './hooks/useCircle'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import JoinCircle from './pages/JoinCircle'
import Dashboard from './components/dashboard/Dashboard'
import ErrorBoundary from './components/ui/ErrorBoundary'

async function initNativePlugins() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { SplashScreen }     = await import('@capacitor/splash-screen')
    const { App: CapApp }      = await import('@capacitor/app')

    // Dark status bar — white icons on our dark background
    await StatusBar.setStyle({ style: Style.Dark })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#050510' })
    }

    // Mark native platform on <body> so CSS can target it
    document.body.classList.add('native', `native-${Capacitor.getPlatform()}`)

    // Deep link handler — captures magic-link auth tokens sent to carecircle://
    // e.g. carecircle://#access_token=xxx&refresh_token=yyy
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      const hash = url.includes('#') ? url.split('#')[1] : url.split('?')[1]
      if (!hash) return
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken) {
        await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken ?? '',
        })
      }
    })

    // Android hardware back button — exit when nothing to go back to
    CapApp.addListener('backButton', () => {
      CapApp.exitApp()
    })

    // Hide splash screen — app is ready
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (err) {
    console.warn('Capacitor plugin init error:', err)
  }
}

function Spinner() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRouter() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { circle, loading: circleLoading, refetch } = useCircle()
  const [showAuth, setShowAuth]         = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  // Capture invite token from /join?token=... on first render
  const [inviteToken, setInviteToken] = useState(() => {
    if (window.location.pathname === '/join') {
      const token = new URLSearchParams(window.location.search).get('token')
      if (token) {
        window.history.replaceState({}, '', '/')
        return token
      }
    }
    return null
  })

  const isLoading = authLoading || (user && circleLoading && !inviteToken && !onboardingDone)
  if (isLoading) return <Spinner />

  if (!user) {
    if (inviteToken || showAuth) return <Auth />
    return <Landing onGetStarted={() => setShowAuth(true)} />
  }

  if (inviteToken) {
    return (
      <JoinCircle
        token={inviteToken}
        onComplete={() => { setInviteToken(null); refetch() }}
      />
    )
  }

  if (!circle && !onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />
  }

  return <Dashboard onLogout={signOut} />
}

export default function App() {
  useEffect(() => { initNativePlugins() }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
