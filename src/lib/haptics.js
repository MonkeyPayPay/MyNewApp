import { Capacitor } from '@capacitor/core'

/**
 * Fires a native haptic buzz on iOS/Android; silently no-ops on web.
 * Kept as thin fire-and-forget wrappers so call sites never need to
 * think about the native/web split or handle promise rejections.
 */
async function fire(fn) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    await fn(Haptics, ImpactStyle, NotificationType)
  } catch {
    // Haptics are a nicety, never worth surfacing an error for
  }
}

export const haptics = {
  /** A light tap — for stepper increments, selection changes. */
  tap: () => fire((h, Impact) => h.impact({ style: Impact.Light })),
  /** A firmer confirmation — for marking a task or medication done. */
  success: () => fire((h, _Impact, Notification) => h.notification({ type: Notification.Success })),
  /** A soft warning buzz — for destructive or alert actions. */
  warning: () => fire((h, _Impact, Notification) => h.notification({ type: Notification.Warning })),
}
