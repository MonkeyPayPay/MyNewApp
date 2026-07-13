import { test, expect } from '@playwright/test'

/**
 * Smoke coverage for the public, unauthenticated surface. This is the
 * safety net the whole-product review asked for — a machine that
 * actually runs the app, not just a person clicking through it.
 *
 * What this does NOT cover: the authenticated core loop (signup → circle
 * creation → task complete). Auth is magic-link only (no password field
 * — see src/pages/Auth.jsx), which means driving it in an automated test
 * requires either (a) a test-only password auth path, or (b) minting a
 * session server-side with the Supabase service-role key and injecting
 * it into localStorage before navigating. Neither exists yet. Do not
 * fake this coverage — extend it for real once one of those exists,
 * using a seeded test circle/account, and never against production data.
 */

// Background calls (Supabase analytics, session check) can legitimately
// fail with a connection-level error in an environment with no Supabase
// project configured or no network egress — that's not a page bug. Real
// JS errors (TypeError, ReferenceError, React warnings) are what a smoke
// test should actually catch.
const BENIGN_NETWORK_ERROR = /ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|Failed to fetch/i

test.describe('Landing page', () => {
  test('loads with no console errors and shows the core value prop', async ({ page }) => {
    const consoleErrors = []
    page.on('console', msg => { if (msg.type() === 'error' && !BENIGN_NETWORK_ERROR.test(msg.text())) consoleErrors.push(msg.text()) })
    page.on('pageerror', err => { if (!BENIGN_NETWORK_ERROR.test(err.message)) consoleErrors.push(err.message) })

    await page.goto('/')

    await expect(page.getByRole('heading', { name: /your family,\s*coordinated/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start free/i }).first()).toBeVisible()

    expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join('\n')}`).toEqual([])
  })

  test('"Start Free" leads to the sign-in screen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /start free/i }).first().click()

    await expect(page.getByRole('heading', { name: /sign in to carecircle/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('privacy and terms pages are reachable', async ({ page }) => {
    const privacy = await page.request.get('/privacy')
    expect(privacy.ok()).toBeTruthy()

    const terms = await page.request.get('/terms')
    expect(terms.ok()).toBeTruthy()
  })
})
