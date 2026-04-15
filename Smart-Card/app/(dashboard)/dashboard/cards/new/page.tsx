'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Upload } from 'lucide-react'
import { gradientPresets } from '@/lib/gradients'

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
  const [useGradient, setUseGradient] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    about: '',
    cardColor: '#3366cc',
    gradientStart: '#0066cc',
    gradientEnd: '#00ccff',
    gradientAngle: '45deg',
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyGradientPreset = (preset: typeof gradientPresets[0]) => {
    setFormData({
      ...formData,
      gradientStart: preset.start,
      gradientEnd: preset.end,
      gradientAngle: preset.angle,
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

      const cardPayload: any = {
        ...formData,
        socialLinks: socialLinksArray,
      }

      if (profileImage) {
        cardPayload.profileImage = profileImage
      }

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardPayload),
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
              <FieldLabel htmlFor="profileImage">Profile Image (Optional)</FieldLabel>
              <div className="flex gap-3">
                {profileImage ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="text-white text-sm">Remove</span>
                    </button>
                  </div>
                ) : null}
                <label className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload image</span>
                  </div>
                </label>
              </div>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Background Style</FieldLabel>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUseGradient(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !useGradient ? 'bg-primary text-white' : 'bg-muted text-foreground'
                    }`}
                  >
                    Solid Color
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseGradient(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      useGradient ? 'bg-primary text-white' : 'bg-muted text-foreground'
                    }`}
                  >
                    Gradient
                  </button>
                </div>

                {!useGradient ? (
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
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {gradientPresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyGradientPreset(preset)}
                          className="p-3 rounded-lg text-sm font-medium text-white border-2 border-transparent hover:border-primary transition-colors"
                          style={{
                            background: `linear-gradient(${preset.angle}, ${preset.start}, ${preset.end})`,
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div>
                          <FieldLabel htmlFor="gradientStart">Start Color</FieldLabel>
                          <input
                            type="color"
                            id="gradientStart"
                            value={formData.gradientStart}
                            onChange={(e) =>
                              setFormData({ ...formData, gradientStart: e.target.value })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <FieldLabel htmlFor="gradientEnd">End Color</FieldLabel>
                          <input
                            type="color"
                            id="gradientEnd"
                            value={formData.gradientEnd}
                            onChange={(e) =>
                              setFormData({ ...formData, gradientEnd: e.target.value })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel htmlFor="gradientAngle">Angle</FieldLabel>
                        <Input
                          id="gradientAngle"
                          placeholder="45deg, 90deg, 180deg, etc."
                          value={formData.gradientAngle}
                          onChange={(e) =>
                            setFormData({ ...formData, gradientAngle: e.target.value })
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}
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
            <div className="h-96">
              <div
                className="h-full rounded-2xl shadow-xl overflow-hidden text-white p-6 flex flex-col justify-between relative cursor-pointer group"
                style={{
                  background: useGradient
                    ? `linear-gradient(${formData.gradientAngle}, ${formData.gradientStart}, ${formData.gradientEnd})`
                    : formData.cardColor,
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  {profileImage && (
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <h4 className="text-2xl font-bold mb-1">{formData.title || 'Job Title'}</h4>
                  {formData.company && (
                    <p className="text-sm opacity-90 mb-2">{formData.company}</p>
                  )}

                  <div className="space-y-1 text-sm mt-4 opacity-90">
                    {formData.email && <p>📧 {formData.email}</p>}
                    {formData.phone && <p>📱 {formData.phone}</p>}
                    {formData.website && <p>🌐 {formData.website}</p>}
                  </div>
                </div>

                {formData.about && (
                  <p className="text-xs opacity-75 italic">{formData.about}</p>
                )}

                <div className="relative z-10 text-center">
                  <p className="text-xs opacity-60">Tap to flip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
