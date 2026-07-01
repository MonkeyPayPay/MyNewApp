# CareCircle — Production Setup

## 1. Supabase SQL Migrations

Run these in the **Supabase SQL Editor** (or via `supabase db push`):

```sql
-- 1. Invite functions
-- Copy and run: supabase/invite.sql

-- 2. Storage bucket + RLS
-- Copy and run: supabase/storage.sql

-- 3. Add push_token column to profiles (for push notifications)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;
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
  STRIPE_FAMILY_PRICE_ID=price_... \
  STRIPE_PRO_PRICE_ID=price_...
```

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
