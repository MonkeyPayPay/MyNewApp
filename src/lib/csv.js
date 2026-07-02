function esc(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

/** Builds the expense-export CSV. Quotes free-text fields (labels, names). */
export function buildExpensesCsv(expenses) {
  const header = ['Date', 'Description', 'Category', 'Amount', 'Paid By']
  const rows = expenses.map(e => [
    e.expense_date ?? '',
    esc(e.label),
    e.category ?? '',
    (e.amount_cents / 100).toFixed(2),
    esc(e.payer?.full_name ?? 'Unknown'),
  ])
  return [header, ...rows].map(r => r.join(',')).join('\n')
}
