const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/**
 * Turns a plain sentence into a due date (YYYY-MM-DD), so a caregiver can
 * type "Pick up prescriptions Tuesday" instead of hunting for a date
 * picker. Deliberately simple keyword matching — not a full NLP date
 * parser — covers the common cases (today/tomorrow/tonight/weekday names)
 * and falls back to today, which is always a reasonable default for
 * something worth capturing right now.
 *
 * `now` is injectable for testing; defaults to the real current time.
 */
export function inferDueDate(text, now = new Date()) {
  const lower = text.toLowerCase()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today); d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }
  if (/\btoday\b|\btonight\b/.test(lower)) {
    return today.toISOString().split('T')[0]
  }
  for (let i = 0; i < DAY_NAMES.length; i++) {
    if (new RegExp(`\\b${DAY_NAMES[i]}\\b`).test(lower)) {
      const d = new Date(today)
      const diff = (i - d.getDay() + 7) % 7 || 7 // next occurrence, not today
      d.setDate(d.getDate() + diff)
      return d.toISOString().split('T')[0]
    }
  }
  return today.toISOString().split('T')[0]
}
