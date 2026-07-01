import { useState, useEffect, lazy, Suspense } from 'react'
import { Capacitor } from '@capacitor/core'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useCircle } from './hooks/useCircle'
import { useSubscription } from './hooks/useSubscription'
import { supabase } from './lib/supabase'
import { usePushNotifications } from './hooks/usePushNotifications'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Lazy-load all heavy pages — reduces initial bundle from ~540KB to <100KB
const Landing    = lazy(() => import('./pages/Landing'))
const Auth       = lazy(() => import('./pages/Auth'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const JoinCircle = lazy(() => import('./pages/JoinCircle'))
const Dashboard  = lazy(() => import('./components/dashboard/Dashboard'))

async function initNativePlugins() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { SplashScreen }     = await import('@capacitor/splash-screen')
    const { App: CapApp }      = await import('@capacitor/app')

    await StatusBar.setStyle({ style: Style.Dark })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#050510' })
    }

    document.body.classList.add('native', `native-${Capacitor.getPlatform()}`)

    // Deep link handler — captures magic-link auth tokens sent to carecircle://
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      const hash = url.includes('#') ? url.split('#')[1] : url.split('?')[1]
      if (!hash) return
      const params        = new URLSearchParams(hash)
      const accessToken   = params.get('access_token')
      const refreshToken  = params.get('refresh_token')
      if (accessToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
      }
    })

    CapApp.addListener('backButton', () => { CapApp.exitApp() })
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

const CHECKOUT_INTENT_KEY = 'carecircle_checkout_intent'

function AppRouter() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { circle, loading: circleLoading, refetch } = useCircle()
  const { startCheckout } = useSubscription()
  const [showAuth, setShowAuth]             = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  usePushNotifications()

  // Capture invite token from /join?token=... on first render
  const [inviteToken, setInviteToken] = useState(() => {
    if (window.location.pathname === '/join') {
      const token = new URLSearchParams(window.location.search).get('token')
      if (token) { window.history.replaceState({}, '', '/'); return token }
    }
    return null
  })

  // After auth + circle ready: fulfil any pending checkout intent from the landing page
  useEffect(() => {
    if (!user || circleLoading) return
    const raw = sessionStorage.getItem(CHECKOUT_INTENT_KEY)
    if (!raw) return
    sessionStorage.removeItem(CHECKOUT_INTENT_KEY)
    try {
      const { tier, interval } = JSON.parse(raw)
      startCheckout(tier, interval).catch(() => {})
    } catch {}
  }, [user, circleLoading])

  // Store checkout intent then show auth — resumed above once signed in
  function handleGetStartedWithPlan(tier, interval) {
    sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify({ tier, interval }))
    setShowAuth(true)
  }

  const isLoading = authLoading || (user && circleLoading && !inviteToken && !onboardingDone)
  if (isLoading) return <Spinner />

  if (!user) {
    if (inviteToken || showAuth) return <Auth />
    return <Landing onGetStarted={() => setShowAuth(true)} onGetStartedWithPlan={handleGetStartedWithPlan} />
  }

  if (inviteToken) {
    return <JoinCircle token={inviteToken} onComplete={() => { setInviteToken(null); refetch() }} />
  }

  if (!circle && !onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />
  }

  return <Dashboard onLogout={signOut} onRegisterNavigate={fn => { window.__careCircleNavigate = fn }} />
}

export default function App() {
  useEffect(() => { initNativePlugins() }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <AppRouter />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}
