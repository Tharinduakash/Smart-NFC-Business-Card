'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Mail, Phone, Globe, Linkedin, Twitter, Github, Facebook, Instagram, MessageCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import FlipCard from '@/components/FlipCard'

interface UserProfile {
  user: {
    id: number
    email: string
    name: string
    profile_image?: string
    bio?: string
    location?: string
  }
  card: {
    id: number
    title: string
    company?: string
    phone?: string
    email?: string
    website?: string
    about?: string
    card_color?: string
    profile_image?: string
    gradient_start?: string
    gradient_end?: string
    gradient_angle?: string
    nfc_url?: string
    socialLinks?: Array<{ platform: string; url: string }>
  }
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
}

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/profile/${userId}`)
      if (!response.ok) throw new Error('Profile not found')
      const data = await response.json()
      setProfile(data)

      // Generate QR code for the profile URL
      const qrResponse = await fetch(`/api/qr?url=/u/${userId}`)
      if (qrResponse.ok) {
        const qrData = await qrResponse.json()
        setQrCode(qrData.qrCode)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const saveContact = () => {
    if (!profile?.card) return

    const card = profile.card
    const user = profile.user

    // Create vCard format
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
TITLE:${card.title}
${card.company ? `ORG:${card.company}` : ''}
${card.email ? `EMAIL:${card.email}` : ''}
${card.phone ? `TEL:${card.phone}` : ''}
${card.website ? `URL:${card.website}` : ''}
${user.location ? `ADR:;;${user.location}` : ''}
${user.bio ? `NOTE:${user.bio}` : ''}
END:VCARD`

    // Download vCard
    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${user.name.replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">{error || 'The profile you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  const { user, card } = profile

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Flip Card */}
            <div className="flex items-center justify-center">
              <FlipCard
                title={card.title}
                company={card.company}
                email={card.email}
                phone={card.phone}
                website={card.website}
                about={card.about}
                profileImage={card.profile_image}
                cardColor={card.card_color}
                gradientStart={card.gradient_start}
                gradientEnd={card.gradient_end}
                gradientAngle={card.gradient_angle}
                nfcUrl={card.nfc_url}
                qrCodeUrl={qrCode || undefined}
              />
            </div>

            {/* Profile Info Card */}
            <div className="rounded-2xl shadow-2xl overflow-hidden bg-card border border-border">
              <div
                className="h-40 p-8 text-white relative overflow-hidden"
                style={{ backgroundColor: card.card_color || '#3366cc' }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{user.name}</h1>
                  <p className="text-lg font-semibold text-white/90">{card.title}</p>
                  {card.company && <p className="text-white/80">{card.company}</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-8 border-t border-border">
              <div className="space-y-4 mb-8">
                {card.email && (
                  <a
                    href={`mailto:${card.email}`}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-foreground font-medium">{card.email}</p>
                    </div>
                  </a>
                )}

                {card.phone && (
                  <a
                    href={`tel:${card.phone}`}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-foreground font-medium">{card.phone}</p>
                    </div>
                  </a>
                )}

                {card.website && (
                  <a
                    href={card.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="text-foreground font-medium truncate">{card.website}</p>
                    </div>
                  </a>
                )}

                {user.location && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📍</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-foreground font-medium">{user.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {card.socialLinks && card.socialLinks.length > 0 && (
                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-4">Follow</p>
                  <div className="flex gap-3 flex-wrap">
                    {card.socialLinks.map((link) => {
                      const Icon = socialIcons[link.platform] || Globe
                      return (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-muted hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors text-foreground hover:text-primary"
                          title={link.platform}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* About */}
              {card.about && (
                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-3">About</p>
                  <p className="text-foreground leading-relaxed">{card.about}</p>
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-3">Bio</p>
                  <p className="text-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}

                {/* Action Buttons */}
                <div className="border-t border-border pt-6 flex gap-3">
                  <Button onClick={saveContact} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Save Contact
                  </Button>
                  {card.email && (
                    <a href={`mailto:${card.email}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Digital business card powered by SmartCard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
