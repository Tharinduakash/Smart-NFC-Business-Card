'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    features: [
      '1 Business Card',
      'QR Code Generation',
      'Basic Analytics (30 days)',
      'Profile Link Sharing',
      'Community Support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Basic',
    price: '9',
    description: 'For emerging professionals',
    features: [
      'Up to 5 Business Cards',
      'QR Code Generation',
      'Advanced Analytics (90 days)',
      'Custom Card Colors',
      'Priority Email Support',
      'vCard Export',
    ],
    cta: 'Subscribe Now',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
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
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    name: 'Premium',
    price: '99',
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
    popular: false,
  },
]

export function Pricing() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (!session?.user) {
      router.push('/signup')
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
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Scale as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  onClick={() => {
                    if (plan.name === 'Premium') {
                      window.location.href = 'mailto:sales@smartcard.app'
                    } else {
                      handleUpgrade(plan.name.toLowerCase())
                    }
                  }}
                  disabled={loading !== null}
                  className="w-full mb-6"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loading === plan.name.toLowerCase() && < Loader2 className="mr-2" />}
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
          <h3 className="text-2xl font-bold text-foreground mb-2">Need a custom plan?</h3>
          <p className="text-muted-foreground mb-6">
            Contact our sales team to discuss enterprise solutions tailored to your needs.
          </p>
          <a href="mailto:sales@smartcard.app">
            <Button variant="outline">Contact Sales</Button>
          </a>
        </div>
      </div>
    </section>
  )
}
