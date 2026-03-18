'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
  })

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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
      } else {
        toast({
          title: 'Success',
          description: 'Plan updated successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade plan',
        variant: 'destructive',
      })
    } finally {
      setUpgrading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        bio: '',
        location: '',
      })
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <div className="max-w-2xl">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-2">Email cannot be changed</p>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell people about yourself..."
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </FieldGroup>

            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* Subscription Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Subscription & Billing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-foreground mb-2">Current Plan</p>
              <p className="text-2xl font-bold text-primary mb-4">Free</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 1 Business Card</li>
                <li>✓ QR Code Generation</li>
                <li>✓ Basic Analytics (30 days)</li>
                <li>✓ Profile Link Sharing</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to unlock unlimited cards, advanced analytics, and team features.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => handleUpgrade('basic')} disabled={upgrading}>
                  {upgrading && <Spinner className="mr-2" />}
                  {upgrading ? 'Processing...' : 'Upgrade to Basic'}
                </Button>
                <Button variant="outline" onClick={() => handleUpgrade('pro')} disabled={upgrading}>
                  View All Plans
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
