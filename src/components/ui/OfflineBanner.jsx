import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const [visible, setVisible] = useState(!navigator.onLine)

  useEffect(() => {
    function goOffline() { setOffline(true); setVisible(true) }
    function goOnline()  {
      setOffline(false)
      // Keep banner visible briefly to confirm reconnection, then hide
      setTimeout(() => setVisible(false), 2500)
    }

    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all duration-500 ${
      offline
        ? 'bg-slate-800 border border-white/10 text-slate-200'
        : 'bg-emerald-900/90 border border-emerald-500/30 text-emerald-300'
    }`}>
      {offline ? (
        <>
          <WifiOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
          You're offline — changes will sync when reconnected
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          Back online
        </>
      )}
    </div>
  )
}
