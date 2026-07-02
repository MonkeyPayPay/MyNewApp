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
supabase functions deploy stripe-webhook
supabase functions deploy summarize-document
supabase functions deploy weekly-digest
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
  APP_URL=https://my-new-app-lyart.vercel.app
```

`WEBHOOK_SECRET` protects `send-notification` and `weekly-digest` from
unauthenticated calls. Add the same value as an `x-webhook-secret` HTTP
header wherever those functions are invoked:

- **send-notification** — Database Webhooks on `tasks` INSERT and
  `care_feed_entries` INSERT (Dashboard → Database → Webhooks → add header)
- **weekly-digest** — the cron schedule's HTTP headers (Dashboard →
  Edge Functions → weekly-digest → Schedule, cron `0 9 * * 1`)

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
