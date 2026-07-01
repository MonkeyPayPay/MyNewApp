import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePushNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return

    let cleanup = () => {}

    async function init() {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')

        const { receive: permStatus } = await PushNotifications.checkPermissions()
        let granted = permStatus === 'granted'

        if (!granted) {
          const { receive } = await PushNotifications.requestPermissions()
          granted = receive === 'granted'
        }

        if (!granted) return

        await PushNotifications.register()

        const tokenListener = await PushNotifications.addListener('registration', async ({ value: token }) => {
          // Store token in profiles so Edge Functions can target this device
          await supabase.from('profiles').update({ push_token: token }).eq('id', user.id)
        })

        const notifListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          // Foreground notification — Capacitor surfaces it automatically on Android,
          // iOS silently receives it. Nothing extra needed here.
          console.log('[Push] received in foreground:', notification.title)
        })

        const actionListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          // User tapped the notification — deep-link to relevant section if provided
          const data = action.notification.data ?? {}
          if (data.nav && window.__careCircleNavigate) {
            window.__careCircleNavigate(data.nav)
          }
        })

        cleanup = () => {
          tokenListener.remove()
          notifListener.remove()
          actionListener.remove()
        }
      } catch (err) {
        console.warn('[Push] init error:', err)
      }
    }

    init()
    return () => cleanup()
  }, [user])
}
