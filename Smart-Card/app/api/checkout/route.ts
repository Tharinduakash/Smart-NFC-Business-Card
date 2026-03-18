import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import Stripe from 'stripe'
import { sql } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const PLANS = {
  free: { id: 'free', name: 'Free', price: 0 },
  basic: { id: 'basic', name: 'Basic', price: 900 },
  pro: { id: 'pro', name: 'Pro', price: 2900 },
  premium: { id: 'premium', name: 'Premium', price: 9900 },
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS]

    // Get or create Stripe customer
    let stripeCustomerId: string

    const userResult = await sql`
      SELECT stripe_customer_id FROM subscriptions WHERE user_id = ${session.user.id}
    `

    if (userResult.length > 0 && userResult[0].stripe_customer_id) {
      stripeCustomerId = userResult[0].stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id.toString(),
        },
      })
      stripeCustomerId = customer.id

      // Save customer ID
      await sql`
        INSERT INTO subscriptions (user_id, stripe_customer_id)
        VALUES (${session.user.id}, ${stripeCustomerId})
        ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = ${stripeCustomerId}
      `
    }

    // For free plan, just update subscription
    if (plan === 'free') {
      await sql`
        UPDATE subscriptions
        SET plan = 'free', status = 'active'
        WHERE user_id = ${session.user.id}
      `
      return NextResponse.json({ success: true, plan: 'free' })
    }

    // Create checkout session for paid plans
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: `SmartCard ${selectedPlan.name} Plan`,
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
      metadata: {
        plan,
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    console.error('[v0] Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
