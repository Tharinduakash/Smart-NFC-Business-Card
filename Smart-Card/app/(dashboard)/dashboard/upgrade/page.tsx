'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 Business Card',
      'QR Code Generation',
      'Basic Analytics (30 days)',
      'Profile Link Sharing',
      'Community Support',
    ],
    cta: 'Current Plan',
    ctaVariant: 'outline' as const,
    popular: false,
    planId: 'free',
  },
  {
    name: 'Basic',
    price: 9,
    description: 'For emerging professionals',
    features: [
      'Up to 5 Business Cards',
      'QR Code Generation',
      'Advanced Analytics (90 days)',
      'Custom Card Colors',
      'Priority Email Support',
      'vCard Export',
    ],
    cta: 'Upgrade to Basic',
    ctaVariant: 'default' as const,
    popular: false,
    planId: 'basic',
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For growing businesses',
    features: [
      'Unlimited Business Cards',
      'QR Code Generation',
      'Advanced Analytics (1 year)',
      'Custom Card Colors & Fonts',
      'Team Members (up to 5)',
      'API Access',
      'Priority Support',
      'vCard & Contact Export',
    ],
    cta: 'Upgrade to Pro',
    ctaVariant: 'default' as const,
    popular: true,
    planId: 'pro',
  },
  {
    name: 'Premium',
    price: 99,
    description: 'For enterprises',
    features: [
      'Unlimited Everything',
      'Custom Domain Support',
      'Team Collaboration (unlimited)',
      'Advanced Analytics & Reports',
      'White-label Options',
      'API & Webhooks',
      '24/7 Dedicated Support',
      'NFC Card Fulfillment Integration',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    popular: false,
    planId: 'premium',
  },
]

export default function UpgradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      toast({
        title: 'Info',
        description: 'You are already on the Free plan',
      })
      return
    }

    if (planId === 'premium') {
      window.location.href = 'mailto:sales@smartcard.app'
      return
    }

    setLoading(planId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to start checkout',
          variant: 'destructive',
        })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Upgrade Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Choose the perfect plan for your business. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`rounded-xl border transition-all ${
              plan.popular
                ? 'border-primary bg-primary/5 shadow-xl relative md:scale-105'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <Button
                onClick={() => handleUpgrade(plan.planId)}
                disabled={loading !== null}
                className="w-full mb-6"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loading === plan.planId && <Loader2 className="mr-2" />}
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-card rounded-xl border border-border text-center">
        <h3 className="text-2xl font-bold text-foreground mb-4">Questions about plans?</h3>
        <p className="text-muted-foreground mb-6">
          Our team is here to help you find the perfect plan for your needs.
        </p>
        <a href="mailto:support@smartcard.app">
          <Button variant="outline">Contact Support</Button>
        </a>
      </div>
    </div>
  )
}
