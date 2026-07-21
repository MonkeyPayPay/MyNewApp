import { describe, it, expect } from 'vitest'
import { inferDueDate } from './dateParsing'

// Fixed reference point: Wednesday, July 15, 2026
const WED = new Date('2026-07-15T09:00:00')

describe('inferDueDate', () => {
  it('recognizes "tomorrow"', () => {
    expect(inferDueDate('Pick up prescriptions tomorrow', WED)).toBe('2026-07-16')
  })

  it('recognizes "today" and "tonight"', () => {
    expect(inferDueDate('Call the pharmacy today', WED)).toBe('2026-07-15')
    expect(inferDueDate('Give evening meds tonight', WED)).toBe('2026-07-15')
  })

  it('resolves a weekday name to its next occurrence, not today even if today matches', () => {
    // WED is itself a Wednesday — "Wednesday" should mean next week, not today
    expect(inferDueDate('Doctor visit Wednesday', WED)).toBe('2026-07-22')
    expect(inferDueDate('Grocery run Friday', WED)).toBe('2026-07-17')
    expect(inferDueDate('Physical therapy Monday', WED)).toBe('2026-07-20')
  })

  it('falls back to today when no date keyword is present', () => {
    expect(inferDueDate('Refill the pill organizer', WED)).toBe('2026-07-15')
  })

  it('is case-insensitive', () => {
    expect(inferDueDate('TOMORROW: pick up prescriptions', WED)).toBe('2026-07-16')
  })

  it('does not false-positive on substrings (e.g. "todaysomething")', () => {
    // "today" only matches as a whole word — a task literally named
    // "todaysomething" should not be misparsed as containing "today"
    expect(inferDueDate('todaysomething', WED)).toBe('2026-07-15') // falls back to today anyway, but for the right reason
  })
})
