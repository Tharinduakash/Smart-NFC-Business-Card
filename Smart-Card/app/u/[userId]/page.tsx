'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Mail, Phone, Globe, Linkedin, Twitter, Github,
  Facebook, Instagram, MessageCircle, Download,
  Wifi, Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import BusinessCard from '@/components/BusinessCard'

interface SocialLink { platform: string; url: string }

interface PublicProfile {
  user: {
    id: number
    email: string
    first_name?: string
    last_name?: string
    name?: string
    profile_image?: string
    bio?: string
    location?: string
  }
  card: {
    id: number
    name?: string
    title: string
    company?: string
    phone?: string
    email?: string
    website?: string
    about?: string
    card_color?: string
    profile_image?: string
    front_gradient_start?: string
    front_gradient_end?: string
    front_gradient_angle?: string
    back_gradient_start?: string
    back_gradient_end?: string
    back_gradient_angle?: string
    nfc_url?: string
    element_positions?: Record<string, unknown>
    socialLinks?: SocialLink[]
  }
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  linkedin:  Linkedin,
  twitter:   Twitter,
  github:    Github,
  facebook:  Facebook,
  instagram: Instagram,
  whatsapp:  MessageCircle,
}

async function writeNFC(url: string) {
  if (!('NDEFReader' in window)) return false
  try {
    // @ts-ignore
    const ndef = new NDEFReader()
    await ndef.write({ records: [{ recordType: 'url', data: url }] })
    return true
  } catch { return false }
}

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId as string

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [nfcMsg,  setNfcMsg]  = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/public/profile/${userId}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile not found</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const { user, card } = profile

  const displayName =
    card.name
    || (user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : null)
    || user.name
    || user.email

  const profileUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://yourapp.com/u/${userId}`

  // ── Download vCard ────────────────────────────────────────────────────────
  const saveContact = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${displayName}`,
      card.title ? `TITLE:${card.title}` : '',
      card.company ? `ORG:${card.company}` : '',
      card.email   ? `EMAIL:${card.email}` : '',
      card.phone   ? `TEL:${card.phone}`   : '',
      card.website ? `URL:${card.website}` : '',
      user.location ? `ADR:;;${user.location}` : '',
      user.bio  ? `NOTE:${user.bio}`  : '',
      card.about ? `NOTE:${card.about}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n')

    const blob = new Blob([lines], { type: 'text/vcard' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${String(displayName).replace(/\s+/g, '_')}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Share profile ─────────────────────────────────────────────────────────
  const shareProfile = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${displayName}'s Card`, url: profileUrl })
    } else {
      await navigator.clipboard.writeText(profileUrl)
      alert('Profile link copied to clipboard!')
    }
  }

  // ── NFC write ─────────────────────────────────────────────────────────────
  const handleNFC = async () => {
    const ok = await writeNFC(profileUrl)
    setNfcMsg(
      ok
        ? 'NFC tag written! Your physical card is now programmed.'
        : 'Web NFC is only supported in Chrome on Android. On iPhone or desktop, share the QR code instead.'
    )
    setTimeout(() => setNfcMsg(null), 5000)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/40">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">

        {/* ── Business Card ─────────────────────────────────────────────── */}
        <BusinessCard
          name={displayName ?? ''}
          title={card.title}
          company={card.company}
          email={card.email}
          phone={card.phone}
          website={card.website}
          about={card.about}
          profileImage={card.profile_image}
          cardColor={card.card_color}
          frontGradientStart={card.front_gradient_start}
          frontGradientEnd={card.front_gradient_end}
          frontGradientAngle={card.front_gradient_angle}
          backGradientStart={card.back_gradient_start}
          backGradientEnd={card.back_gradient_end}
          backGradientAngle={card.back_gradient_angle}
          nfcUrl={card.nfc_url ?? profileUrl}
          socialLinks={card.socialLinks}
          elementPositions={card.element_positions as any}
        />

        <p className="text-center text-xs text-muted-foreground">
          Tap card to flip · Scan QR on back to save contact
        </p>

        {/* NFC notification */}
        {nfcMsg && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            {nfcMsg}
          </div>
        )}

        {/* ── Primary actions ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={saveContact} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Save Contact
          </Button>
          <Button variant="outline" onClick={shareProfile} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* ── Contact info card ──────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header band */}
          <div
            className="px-6 py-5 text-white"
            style={{
              background: card.front_gradient_start && card.front_gradient_end
                ? `linear-gradient(${card.front_gradient_angle ?? '135deg'}, ${card.front_gradient_start}, ${card.front_gradient_end})`
                : card.card_color ?? '#3366cc',
            }}
          >
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-white/90 font-medium">{card.title}</p>
            {card.company && <p className="text-white/75 text-sm">{card.company}</p>}
          </div>

          {/* Contact rows */}
          <div className="divide-y divide-border">
            {card.email && (
              <a href={`mailto:${card.email}`} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{card.email}</p>
                </div>
              </a>
            )}

            {card.phone && (
              <a href={`tel:${card.phone}`} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{card.phone}</p>
                </div>
              </a>
            )}

            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {card.website.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Social links */}
          {card.socialLinks && card.socialLinks.length > 0 && (
            <div className="px-6 py-5 border-t border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3">
                Connect
              </p>
              <div className="flex gap-3 flex-wrap">
                {card.socialLinks.map(link => {
                  const Icon = SOCIAL_ICONS[link.platform] || Globe
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
                      title={link.platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* About / bio */}
          {(card.about || user.bio) && (
            <div className="px-6 py-5 border-t border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                About
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {card.about || user.bio}
              </p>
            </div>
          )}

          {/* NFC write button */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
              onClick={handleNFC}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Write to NFC Tag
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Android Chrome only · Programs a physical NFC card with this profile
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Powered by SmartCard · Digital NFC Business Cards
        </p>
      </div>
    </div>
  )
}
