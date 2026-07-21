import { describe, it, expect } from 'vitest'
import { buildExpensesCsv } from './csv'

const expense = (over = {}) => ({
  expense_date: '2026-07-01',
  label: 'Pharmacy run',
  category: 'medication',
  amount_cents: 4250,
  payer: { full_name: 'Jordan O\'Brien' },
  ...over,
})

describe('buildExpensesCsv', () => {
  it('produces a header plus one row per expense', () => {
    const csv = buildExpensesCsv([expense()])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Date,Description,Category,Amount,Paid By')
    expect(lines[1]).toBe('2026-07-01,"Pharmacy run",medication,42.50,"Jordan O\'Brien"')
    expect(lines).toHaveLength(2)
  })

  it('escapes double quotes in labels (CSV injection of columns)', () => {
    const csv = buildExpensesCsv([expense({ label: 'Meds "urgent", refill' })])
    expect(csv.split('\n')[1]).toContain('"Meds ""urgent"", refill"')
    // The comma inside the quoted label must not create an extra column
    expect(csv.split('\n')[1].match(/,/g).length).toBeGreaterThanOrEqual(4)
  })

  it('converts cents to dollars with two decimals', () => {
    const csv = buildExpensesCsv([expense({ amount_cents: 100 })])
    expect(csv).toContain(',1.00,')
  })

  it('handles missing payer and null label', () => {
    const csv = buildExpensesCsv([expense({ payer: null, label: null })])
    const row = csv.split('\n')[1]
    expect(row).toContain('"Unknown"')
    expect(row).toContain('""')
  })

  it('handles the empty list', () => {
    expect(buildExpensesCsv([])).toBe('Date,Description,Category,Amount,Paid By')
  })
})
