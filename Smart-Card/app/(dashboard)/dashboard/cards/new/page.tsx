'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Upload } from 'lucide-react'
import { gradientPresets } from '@/lib/gradients'
import BusinessCard from '@/components/BusinessCard'

const SOCIAL_PLATFORMS = [
  { id: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/yourprofile' },
  { id: 'twitter',   label: 'Twitter',   placeholder: 'https://twitter.com/yourhandle' },
  { id: 'github',    label: 'GitHub',    placeholder: 'https://github.com/yourprofile' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
  { id: 'whatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/1234567890' },
  { id: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/yourprofile' },
]

export default function NewCardPage() {
  const router        = useRouter()
  const { toast }     = useToast()
  const { data: session } = useSession()

  const [loading, setLoading]           = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [socialLinks, setSocialLinks]   = useState<Record<string, string>>({})
  const [activeTab, setActiveTab]       = useState<'front' | 'back'>('front')

  const [formData, setFormData] = useState({
    name:                session?.user?.name || '',
    title:               '',
    company:             '',
    phone:               '',
    email:               '',
    website:             '',
    about:               '',
    frontGradientStart:  '#0066cc',
    frontGradientEnd:    '#00b386',
    frontGradientAngle:  '135deg',
    backGradientStart:   '#0052a3',
    backGradientEnd:     '#00c853',
    backGradientAngle:   '135deg',
  })

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update(e.target.name, e.target.value)

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => setProfileImage(evt.target?.result as string)
    reader.readAsDataURL(file)
  }

  const socialLinksArray = Object.entries(socialLinks)
    .filter(([, url]) => url.trim())
    .map(([platform, url]) => ({ platform, url }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast({ title: 'Required', description: 'Please enter your job title.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        name:               formData.name,
        title:              formData.title,
        company:            formData.company,
        phone:              formData.phone,
        email:              formData.email,
        website:            formData.website,
        about:              formData.about,
        frontGradientStart: formData.frontGradientStart,
        frontGradientEnd:   formData.frontGradientEnd,
        frontGradientAngle: formData.frontGradientAngle,
        backGradientStart:  formData.backGradientStart,
        backGradientEnd:    formData.backGradientEnd,
        backGradientAngle:  formData.backGradientAngle,
        socialLinks:        socialLinksArray,
      }
      if (profileImage) body.profileImage = profileImage

      const res = await fetch('/api/cards', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create card')
      }

      const card = await res.json()
      toast({ title: 'Card created!', description: 'Now design it to your liking.' })
      router.push(`/dashboard/cards/${card.id}/edit`)
    } catch (err: unknown) {
      toast({
        title:       'Error',
        description: err instanceof Error ? err.message : 'Failed to create card',
        variant:     'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Business Card</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Fill in your details — you can drag &amp; reposition everything after saving.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Identity */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Identity
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                  <Input
                    id="name" name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="title">Job Title *</FieldLabel>
                  <Input
                    id="title" name="title"
                    placeholder="CEO, Designer, Developer…"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <Input
                  id="company" name="company"
                  placeholder="Acme Corporation"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>
            </section>

            {/* Contact */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Contact
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email" name="email" type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone" name="phone"
                    placeholder="+1 555 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website" name="website"
                  placeholder="https://yoursite.com"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="about">About / Bio</FieldLabel>
                <textarea
                  id="about" name="about"
                  placeholder="A short description about you or your business…"
                  value={formData.about}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                />
              </FieldGroup>
            </section>

            {/* Profile photo */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Profile Photo (Optional)
              </h2>
              <div className="flex items-center gap-4">
                {profileImage && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border shrink-0">
                    <Image src={profileImage} alt="Profile" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <input type="file" accept="image/*" onChange={handleProfileImage} disabled={loading} className="hidden" />
                  <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                  <span className="text-sm text-muted-foreground">
                    {profileImage ? 'Replace photo' : 'Upload photo'}
                  </span>
                </label>
              </div>
            </section>

            {/* Card colours */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Card Colours
              </h2>

              <div className="flex gap-2 border-b border-border pb-1">
                {(['front', 'back'] as const).map(side => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setActiveTab(side)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
                      activeTab === side
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {side === 'front' ? 'Front Side' : 'Back Side'}
                  </button>
                ))}
              </div>

              {/* Gradient presets */}
              <div className="grid grid-cols-4 gap-2">
                {gradientPresets.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (activeTab === 'front') {
                        update('frontGradientStart', preset.start)
                        update('frontGradientEnd',   preset.end)
                        update('frontGradientAngle', preset.angle)
                      } else {
                        update('backGradientStart', preset.start)
                        update('backGradientEnd',   preset.end)
                        update('backGradientAngle', preset.angle)
                      }
                    }}
                    title={preset.name}
                    className="h-10 rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                    style={{
                      background: `linear-gradient(${preset.angle}, ${preset.start}, ${preset.end})`,
                    }}
                  />
                ))}
              </div>

              {/* Custom colours */}
              <div className="grid grid-cols-3 gap-3">
                {activeTab === 'front' ? (
                  <>
                    <div>
                      <FieldLabel>Start</FieldLabel>
                      <input
                        type="color"
                        value={formData.frontGradientStart}
                        onChange={e => update('frontGradientStart', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>
                    <div>
                      <FieldLabel>End</FieldLabel>
                      <input
                        type="color"
                        value={formData.frontGradientEnd}
                        onChange={e => update('frontGradientEnd', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>
                    <div>
                      <FieldLabel>Angle</FieldLabel>
                      <Input
                        value={formData.frontGradientAngle}
                        onChange={e => update('frontGradientAngle', e.target.value)}
                        placeholder="135deg"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <FieldLabel>Start</FieldLabel>
                      <input
                        type="color"
                        value={formData.backGradientStart}
                        onChange={e => update('backGradientStart', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>
                    <div>
                      <FieldLabel>End</FieldLabel>
                      <input
                        type="color"
                        value={formData.backGradientEnd}
                        onChange={e => update('backGradientEnd', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>
                    <div>
                      <FieldLabel>Angle</FieldLabel>
                      <Input
                        value={formData.backGradientAngle}
                        onChange={e => update('backGradientAngle', e.target.value)}
                        placeholder="135deg"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Social links */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Social Links (Optional)
              </h2>
              {SOCIAL_PLATFORMS.map(p => (
                <FieldGroup key={p.id}>
                  <FieldLabel htmlFor={p.id}>{p.label}</FieldLabel>
                  <Input
                    id={p.id}
                    type="url"
                    placeholder={p.placeholder}
                    value={socialLinks[p.id] || ''}
                    onChange={e => setSocialLinks(prev => ({ ...prev, [p.id]: e.target.value }))}
                    disabled={loading}
                  />
                </FieldGroup>
              ))}
            </section>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Spinner className="mr-2 w-4 h-4" />}
                {loading ? 'Creating…' : 'Create Card & Design It'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>

        {/* ── Live preview ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Live Preview
            </p>
            <BusinessCard
              name={formData.name || session?.user?.name || 'Your Name'}
              title={formData.title || 'Job Title'}
              company={formData.company}
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
              socialLinks={socialLinksArray}
            />
            <p className="text-xs text-muted-foreground text-center">
              Click to see front / back · After saving, drag elements to reposition
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
