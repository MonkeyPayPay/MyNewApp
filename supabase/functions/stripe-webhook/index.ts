import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const TIER_BY_PRICE: Record<string, 'family' | 'pro'> = {
  [Deno.env.get('STRIPE_PRICE_FAMILY_MONTHLY') ?? '']: 'family',
  [Deno.env.get('STRIPE_PRICE_FAMILY_ANNUAL') ?? '']: 'family',
  [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') ?? '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_PRO_ANNUAL') ?? '']: 'pro',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const subscription = (event.data.object as Stripe.Subscription)

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const priceId = subscription.items.data[0]?.price.id
      const tier = TIER_BY_PRICE[priceId] ?? 'free'
      const userId = subscription.metadata?.supabase_user_id

      if (userId) {
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          tier,
          status: subscription.status as any,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('subscriptions').update({
          tier: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
