import { describe, it, expect } from 'vitest'
import { canAccess, TIERS } from './entitlements'

describe('canAccess — the paywall', () => {
  it('free tier is blocked from gated features', () => {
    expect(canAccess('free', 'active', 'documents')).toBe(false)
    expect(canAccess('free', 'active', 'expenses')).toBe(false)
    expect(canAccess('free', 'active', 'ai_advisor')).toBe(false)
    expect(canAccess('free', 'active', 'professional_carer')).toBe(false)
  })

  it('free tier can use ungated features', () => {
    expect(canAccess('free', 'active', 'tasks')).toBe(true)
    expect(canAccess('free', 'active', undefined)).toBe(true)
  })

  it('family unlocks family-tier features but not pro-only', () => {
    expect(canAccess('family', 'active', 'documents')).toBe(true)
    expect(canAccess('family', 'active', 'ai_advisor')).toBe(true)
    expect(canAccess('family', 'active', 'professional_carer')).toBe(false)
    expect(canAccess('family', 'active', 'hipaa')).toBe(false)
  })

  it('pro unlocks everything', () => {
    expect(canAccess('pro', 'active', 'documents')).toBe(true)
    expect(canAccess('pro', 'active', 'professional_carer')).toBe(true)
  })

  it('trialing counts as active — the 14-day trial must unlock features', () => {
    expect(canAccess('family', 'trialing', 'documents')).toBe(true)
  })

  it('lapsed subscriptions lose access', () => {
    expect(canAccess('family', 'past_due', 'documents')).toBe(false)
    expect(canAccess('pro', 'canceled', 'professional_carer')).toBe(false)
  })

  it('missing status defaults to active (free users have no subscription row)', () => {
    expect(canAccess('free', undefined, 'tasks')).toBe(true)
    expect(canAccess('free', null, 'documents')).toBe(false)
  })

  it('unknown tier ranks as free', () => {
    expect(canAccess('platinum', 'active', 'documents')).toBe(false)
  })

  it('tier ranks are ordered free < family < pro', () => {
    expect(TIERS.free.rank).toBeLessThan(TIERS.family.rank)
    expect(TIERS.family.rank).toBeLessThan(TIERS.pro.rank)
  })
})
