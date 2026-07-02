export const TIERS = {
  free:   { label: 'Free',   rank: 0 },
  family: { label: 'Family', rank: 1 },
  pro:    { label: 'Pro',    rank: 2 },
}

const GATES = {
  documents:          1, // family+
  expenses:           1,
  ai_advisor:         1,
  unlimited_members:  1,
  professional_carer: 2, // pro only
  hipaa:              2,
}

const ACTIVE_STATUSES = ['active', 'trialing']

/**
 * The paywall. Unknown features default to allowed; unknown tiers rank as
 * free; a lapsed subscription (past_due/canceled) loses gated features.
 */
export function canAccess(tier, status, feature) {
  const isActive = ACTIVE_STATUSES.includes(status ?? 'active')
  if (!isActive) return false
  const required = GATES[feature]
  if (required === undefined) return true
  return (TIERS[tier]?.rank ?? 0) >= required
}
