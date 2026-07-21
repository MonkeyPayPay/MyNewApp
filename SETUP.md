# CareCircle — Production Setup

## 1. Supabase SQL Migrations

Run these in the **Supabase SQL Editor** (or via `supabase db push`):

```sql
-- 1. Invite functions
-- Copy and run: supabase/invite.sql

-- 2. Storage bucket + RLS
-- Copy and run: supabase/storage.sql

-- 3. Security & correctness fixes (profile visibility, push_token column)
-- Copy and run: supabase/fixes.sql

-- 4. Funnel analytics (events table + example funnel query)
-- Copy and run: supabase/analytics.sql

-- 5. Vitals / daily wellness log (mood, water, blood pressure, pain)
-- Copy and run: supabase/vitals.sql

-- 6. Push notification platform tracking (ios/android)
-- Copy and run: supabase/push.sql

-- 7. Care role (caregiver / helper / recipient) — powers the narrower
--    recipient-mode dashboard
-- Copy and run: supabase/care_role.sql

-- 8. Connective tissue: receipt photos on expenses, document links on
--    appointments
-- Copy and run: supabase/attachments.sql

-- 9. Recurring tasks / medication schedules
-- Copy and run: supabase/recurring_tasks.sql

-- 10. Scoped professional-caregiver role (Pro tier)
-- Copy and run: supabase/professional_role.sql
```

## 2. Supabase Edge Functions

```bash
# Link your project (one-time)
supabase link --project-ref <your-project-ref>

# Deploy all functions
supabase functions deploy ai-care-advisor
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy send-invite
supabase functions deploy send-notification
supabase functions deploy send-push
supabase functions deploy stripe-webhook
supabase functions deploy summarize-document
supabase functions deploy weekly-digest
supabase functions deploy trial-reminders
supabase functions deploy materialize-recurring-tasks
```

## 3. Supabase Secrets

```bash
supabase secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  RESEND_API_KEY=re_... \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_PRICE_FAMILY_MONTHLY=price_... \
  STRIPE_PRICE_FAMILY_ANNUAL=price_... \
  STRIPE_PRICE_PRO_MONTHLY=price_... \
  STRIPE_PRICE_PRO_ANNUAL=price_... \
  WEBHOOK_SECRET=$(openssl rand -hex 24) \
  APP_URL=https://my-new-app-lyart.vercel.app \
  APNS_KEY_P8="$(cat AuthKey_XXXXXXXXXX.p8)" \
  APNS_KEY_ID=XXXXXXXXXX \
  APNS_TEAM_ID=XXXXXXXXXX \
  APNS_BUNDLE_ID=app.carecircle \
  FCM_PROJECT_ID=your-firebase-project-id \
  FCM_SERVICE_ACCOUNT_JSON="$(cat firebase-service-account.json | tr -d '\n')"
```

### Push notification credentials — where these come from

**iOS (APNs)**: Apple Developer → Certificates, IDs & Profiles → Keys →
create an "Apple Push Notifications service (APNs)" key. Download the
`.p8` file once (Apple only lets you download it once), note the Key ID
and your Team ID (top-right of the Developer portal).

**Android (FCM)**: Firebase Console → your project → Project Settings →
Service Accounts → "Generate new private key". This downloads the JSON
Capacitor's Android build also needs as `android/app/google-services.json`
(same Firebase project, different file — the service account JSON goes
into the Supabase secret above, `google-services.json` goes into the repo).

Push sending is wired into `send-notification` (task-assigned, new care
log entry) via `supabase/functions/_shared/push.ts`, which signs JWTs
directly with Deno's Web Crypto API — no Firebase Admin SDK or APNs
library needed. **This has not been tested against real devices** — the
cryptography (ES256 for APNs, RS256 for the FCM OAuth2 exchange) is
correct per each platform's documented token format, but verify with a
real device before relying on it.

`WEBHOOK_SECRET` protects `send-notification` and `weekly-digest` from
unauthenticated calls. Add the same value as an `x-webhook-secret` HTTP
header wherever those functions are invoked:

- **send-notification** — Database Webhooks on `tasks` INSERT and
  `care_feed_entries` INSERT (Dashboard → Database → Webhooks → add header)
- **weekly-digest** — the cron schedule's HTTP headers (Dashboard →
  Edge Functions → weekly-digest → Schedule, cron `0 9 * * 1`)
- **trial-reminders** — the cron schedule's HTTP headers (Dashboard →
  Edge Functions → trial-reminders → Schedule, cron `0 14 * * *`) — emails
  anyone whose 14-day trial has 3 days left, deduped via `notification_log`
  so it only ever sends once per trial
- **materialize-recurring-tasks** — the cron schedule's HTTP headers
  (Dashboard → Edge Functions → materialize-recurring-tasks → Schedule,
  cron `0 6 * * *`) — creates today's occurrence of every active
  recurring task (e.g. a daily medication reminder). The app also
  materializes today's occurrence immediately on creation client-side, so
  a caregiver setting one up sees it right away instead of waiting for
  tomorrow's cron run.

**Invites need no webhook**: the app calls `send-invite` directly after
creating an invitation. If you prefer a Database Webhook on `invitations`
INSERT instead, add the `x-webhook-secret` header there and remove the
`functions.invoke('send-invite', ...)` call in `src/hooks/useCircle.js`
to avoid duplicate emails.

## 4. Stripe Products

Create two products in the [Stripe Dashboard](https://dashboard.stripe.com/products):

| Product | Price | Billing | Notes |
|---------|-------|---------|-------|
| CareCircle Family | $9.99/mo | Monthly | Copy the Price ID → `STRIPE_FAMILY_PRICE_ID` |
| CareCircle Pro    | $19.99/mo | Monthly | Copy the Price ID → `STRIPE_PRO_PRICE_ID` |

Then add a webhook endpoint pointing to:
`https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 5. Capacitor Icon Sizes (local only)

```bash
npm install --save-dev @capacitor/assets
node scripts/gen-icons.js
npx cap sync
```

## 6. Mobile Builds

```bash
# iOS
npx cap open ios   # Opens Xcode → Archive → App Store Connect

# Android
npx cap open android   # Opens Android Studio → Generate Signed Bundle
```

## 7. Push Notifications

### iOS
Enable the **Push Notifications** capability in Xcode:
`Signing & Capabilities` → `+ Capability` → `Push Notifications`

Upload your APNs key to Supabase:
`Project Settings → Edge Functions → Apple Push Notifications`

### Android
Add `google-services.json` from Firebase Console to `android/app/`.

## 8. Testing

```bash
npm test        # Unit tests (vitest) — src/lib/*.test.js
npm run test:e2e  # Playwright smoke tests — tests/*.spec.js
```

The Playwright suite currently covers the public landing/auth surface
only (page loads, no JS errors, "Start Free" reaches the sign-in screen,
legal pages resolve). It does **not** cover the authenticated core loop
(signup → circle creation → task complete) — auth is magic-link only, so
driving it in CI needs either a test-only password auth path or a
session minted server-side with the service-role key and injected before
navigating. See the comment at the top of `tests/smoke.spec.js`.
