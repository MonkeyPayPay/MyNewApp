import { supabase } from './supabase'

/**
 * Fire-and-forget funnel event. Never throws, never blocks the UI.
 * Events land in the write-only public.events table (supabase/analytics.sql).
 *
 * options.once — dedupe per browser session (e.g. page views)
 */
export function track(event, props = {}, { once = false } = {}) {
  try {
    if (once) {
      const key = `cc_evt_${event}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    }
    supabase.auth.getSession()
      .then(({ data: { session } }) =>
        supabase.from('events').insert({
          event,
          props,
          user_id: session?.user?.id ?? null,
        })
      )
      .then(() => {})
      .catch(() => {})
  } catch {
    // Analytics must never break the app
  }
}
