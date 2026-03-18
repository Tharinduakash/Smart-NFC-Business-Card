'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft } from 'lucide-react'

const socialPlatforms = [
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
  { id: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourhandle' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/yourprofile' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourprofile' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/1234567890' },
]

export default function NewCardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    about: '',
    cardColor: '#3366cc',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks({
      ...socialLinks,
      [platform]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast({
        title: 'Error',
        description: 'Please enter a job title',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const socialLinksArray = Object.entries(socialLinks)
        .filter(([_, url]) => url.trim())
        .map(([platform, url]) => ({ platform, url }))

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          socialLinks: socialLinksArray,
        }),
      })

      if (!response.ok) throw new Error('Failed to create card')

      const card = await response.json()
      toast({
        title: 'Success',
        description: 'Card created successfully!',
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create card',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Business Card</h1>
          <p className="text-muted-foreground mt-1">Fill in your professional details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FieldGroup>
                <FieldLabel htmlFor="title">Job Title *</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  placeholder="CEO, Designer, Developer, etc."
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <Input
                  id="company"
                  name="company"
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FieldGroup>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel htmlFor="website">Website</FieldLabel>
              <Input
                id="website"
                name="website"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={handleChange}
                disabled={loading}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="about">About (Bio)</FieldLabel>
              <textarea
                id="about"
                name="about"
                placeholder="Tell people about yourself..."
                value={formData.about}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="cardColor">Card Color</FieldLabel>
              <div className="flex gap-3">
                <input
                  type="color"
                  id="cardColor"
                  name="cardColor"
                  value={formData.cardColor}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.cardColor}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex-1"
                />
              </div>
            </FieldGroup>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Social Links (Optional)</h3>
              <div className="space-y-4">
                {socialPlatforms.map((platform) => (
                  <FieldGroup key={platform.id}>
                    <FieldLabel htmlFor={platform.id}>{platform.label}</FieldLabel>
                    <Input
                      id={platform.id}
                      type="url"
                      placeholder={platform.placeholder}
                      value={socialLinks[platform.id] || ''}
                      onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                      disabled={loading}
                    />
                  </FieldGroup>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Spinner className="mr-2" />}
                {loading ? 'Creating...' : 'Create Card'}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" type="button" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-semibold text-foreground mb-4">Preview</h3>
            <div
              className="rounded-lg overflow-hidden shadow-xl text-white p-6"
              style={{ backgroundColor: formData.cardColor }}
            >
              <h4 className="text-2xl font-bold mb-1">{formData.title || 'Job Title'}</h4>
              {formData.company && (
                <p className="text-sm opacity-90 mb-4">{formData.company}</p>
              )}

              <div className="space-y-2 text-sm mt-6">
                {formData.email && (
                  <p className="opacity-80 truncate">📧 {formData.email}</p>
                )}
                {formData.phone && (
                  <p className="opacity-80 truncate">📱 {formData.phone}</p>
                )}
                {formData.website && (
                  <p className="opacity-80 truncate">🌐 {formData.website}</p>
                )}
              </div>

              {formData.about && (
                <p className="text-xs opacity-75 mt-4 italic">{formData.about}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
