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
import FlipCard from '@/components/FlipCard'

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
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front')
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
    frontGradientStart: '#0066cc',
    frontGradientEnd: '#00b386',
    frontGradientAngle: '135deg',
    backGradientStart: '#0052a3',
    backGradientEnd: '#00c853',
    backGradientAngle: '135deg',
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
        title: formData.title,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        about: formData.about,
        cardColor: formData.cardColor,
        gradientStart: formData.gradientStart,
        gradientEnd: formData.gradientEnd,
        gradientAngle: formData.gradientAngle,
        frontGradientStart: formData.frontGradientStart,
        frontGradientEnd: formData.frontGradientEnd,
        frontGradientAngle: formData.frontGradientAngle,
        backGradientStart: formData.backGradientStart,
        backGradientEnd: formData.backGradientEnd,
        backGradientAngle: formData.backGradientAngle,
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
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
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
              <FieldLabel>Card Sides Styling</FieldLabel>
              <div className="space-y-4">
                {/* Tab Selection */}
                <div className="flex gap-2 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab('front')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'front'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('back')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'back'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    Back Side
                  </button>
                </div>

                {/* Front Side Gradients */}
                {activeTab === 'front' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {gradientPresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              frontGradientStart: preset.start,
                              frontGradientEnd: preset.end,
                              frontGradientAngle: preset.angle,
                            })
                          }
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
                        <div className="flex-1">
                          <FieldLabel htmlFor="frontGradientStart">Start Color</FieldLabel>
                          <input
                            type="color"
                            id="frontGradientStart"
                            value={formData.frontGradientStart}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                frontGradientStart: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <FieldLabel htmlFor="frontGradientEnd">End Color</FieldLabel>
                          <input
                            type="color"
                            id="frontGradientEnd"
                            value={formData.frontGradientEnd}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                frontGradientEnd: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel htmlFor="frontGradientAngle">Angle</FieldLabel>
                        <Input
                          id="frontGradientAngle"
                          placeholder="135deg, 90deg, 45deg, etc."
                          value={formData.frontGradientAngle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              frontGradientAngle: e.target.value,
                            })
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Back Side Gradients */}
                {activeTab === 'back' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {gradientPresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              backGradientStart: preset.start,
                              backGradientEnd: preset.end,
                              backGradientAngle: preset.angle,
                            })
                          }
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
                        <div className="flex-1">
                          <FieldLabel htmlFor="backGradientStart">Start Color</FieldLabel>
                          <input
                            type="color"
                            id="backGradientStart"
                            value={formData.backGradientStart}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                backGradientStart: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <FieldLabel htmlFor="backGradientEnd">End Color</FieldLabel>
                          <input
                            type="color"
                            id="backGradientEnd"
                            value={formData.backGradientEnd}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                backGradientEnd: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel htmlFor="backGradientAngle">Angle</FieldLabel>
                        <Input
                          id="backGradientAngle"
                          placeholder="135deg, 90deg, 45deg, etc."
                          value={formData.backGradientAngle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              backGradientAngle: e.target.value,
                            })
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
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
            <FlipCard
              title={formData.title || 'Job Title'}
              company={formData.company || 'Company Name'}
              email={formData.email}
              phone={formData.phone}
              website={formData.website}
              about={formData.about}
              profileImage={profileImage || undefined}
              frontGradientStart={formData.frontGradientStart}
              frontGradientEnd={formData.frontGradientEnd}
              frontGradientAngle={formData.frontGradientAngle}
              backGradientStart={formData.backGradientStart}
              backGradientEnd={formData.backGradientEnd}
              backGradientAngle={formData.backGradientAngle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
