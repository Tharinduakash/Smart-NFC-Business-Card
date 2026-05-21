'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Mail, Phone, Globe, Linkedin, Twitter, Github,
  Facebook, Instagram, MessageCircle, Nfc,
} from 'lucide-react'
import type { ElementPositions } from '@/lib/cards'

// ─── Default element positions (% of card width/height) ─────────────────────
export const DEFAULT_POSITIONS: ElementPositions = {
  front: {
    name:    { x: 6,  y: 47 },
    title:   { x: 6,  y: 61 },
    company: { x: 6,  y: 72 },
    contact: { x: 6,  y: 83 },
  },
  back: {
    info:    { x: 5,  y: 6  },
    qrCode:  { x: 57, y: 6  },
    about:   { x: 5,  y: 48 },
    social:  { x: 5,  y: 80 },
  },
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  linkedin:  Linkedin,
  twitter:   Twitter,
  github:    Github,
  facebook:  Facebook,
  instagram: Instagram,
  whatsapp:  MessageCircle,
}

// ─── Scale-aware font size ────────────────────────────────────────────────────
function scaledFont(minPx: number, pct: number, maxPx: number, scale: number = 1): string {
  const s = scale ?? 1
  return `clamp(${Math.round(minPx * s)}px, ${(pct * s).toFixed(2)}%, ${Math.round(maxPx * s)}px)`
}

// ─── NFC icon (concentric arc rings like a real NFC symbol) ─────────────────
function NfcSymbol() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-white">
      {/* Center dot */}
      <circle cx="10" cy="14" r="2.2" fill="currentColor" opacity="0.95" />
      {/* Arc 1 */}
      <path
        d="M14 8.5 A8 8 0 0 1 14 19.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        fill="none" opacity="0.85"
      />
      {/* Arc 2 */}
      <path
        d="M17.5 5 A12 12 0 0 1 17.5 23"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        fill="none" opacity="0.65"
      />
      {/* Arc 3 */}
      <path
        d="M21 2.5 A16 16 0 0 1 21 25.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        fill="none" opacity="0.40"
      />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BusinessCardProps {
  name: string
  title: string
  company?: string
  email?: string
  phone?: string
  website?: string
  about?: string
  profileImage?: string
  frontGradientStart?: string
  frontGradientEnd?: string
  frontGradientAngle?: string
  backGradientStart?: string
  backGradientEnd?: string
  backGradientAngle?: string
  cardColor?: string
  nfcUrl?: string
  socialLinks?: Array<{ platform: string; url: string }>
  elementPositions?: ElementPositions

  // Editor-only props
  isEditing?: boolean
  editingSide?: 'front' | 'back'
  selectedElement?: string | null
  onElementMouseDown?: (
    e: React.MouseEvent,
    side: 'front' | 'back',
    element: string
  ) => void
}

export default function BusinessCard({
  name,
  title,
  company,
  email,
  phone,
  website,
  about,
  profileImage,
  frontGradientStart = '#0066cc',
  frontGradientEnd   = '#00b386',
  frontGradientAngle = '135deg',
  backGradientStart  = '#0052a3',
  backGradientEnd    = '#00c853',
  backGradientAngle  = '135deg',
  cardColor          = '#3366cc',
  nfcUrl,
  socialLinks = [],
  elementPositions,
  isEditing      = false,
  editingSide    = 'front',
  selectedElement = null,
  onElementMouseDown,
}: BusinessCardProps) {
  const [isFlipped, setIsFlipped]   = useState(false)
  const [qrDataUrl, setQrDataUrl]   = useState<string | null>(null)

  // In editor mode the flip is controlled externally
  const showingBack = isEditing ? editingSide === 'back' : isFlipped

  useEffect(() => {
    if (!nfcUrl) return
    fetch(`/api/qr?url=${encodeURIComponent(nfcUrl)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.qrCode && setQrDataUrl(d.qrCode))
      .catch(() => {})
  }, [nfcUrl])

  const frontBg = frontGradientStart && frontGradientEnd
    ? `linear-gradient(${frontGradientAngle}, ${frontGradientStart}, ${frontGradientEnd})`
    : cardColor

  const backBg = backGradientStart && backGradientEnd
    ? `linear-gradient(${backGradientAngle}, ${backGradientStart}, ${backGradientEnd})`
    : cardColor

  // Merge element positions with defaults
  const pos = {
    front: {
      name:    { ...DEFAULT_POSITIONS.front!.name!,    ...elementPositions?.front?.name    },
      title:   { ...DEFAULT_POSITIONS.front!.title!,   ...elementPositions?.front?.title   },
      company: { ...DEFAULT_POSITIONS.front!.company!, ...elementPositions?.front?.company },
      contact: { ...DEFAULT_POSITIONS.front!.contact!, ...elementPositions?.front?.contact },
    },
    back: {
      info:   { ...DEFAULT_POSITIONS.back!.info!,   ...elementPositions?.back?.info   },
      qrCode: { ...DEFAULT_POSITIONS.back!.qrCode!, ...elementPositions?.back?.qrCode },
      about:  { ...DEFAULT_POSITIONS.back!.about!,  ...elementPositions?.back?.about  },
      social: { ...DEFAULT_POSITIONS.back!.social!, ...elementPositions?.back?.social },
    },
  }

  const dragProps = (side: 'front' | 'back', element: string) =>
    isEditing
      ? {
          onMouseDown: (e: React.MouseEvent) =>
            onElementMouseDown?.(e, side, element),
          style: {
            cursor: 'move',
            userSelect: 'none' as const,
          } as React.CSSProperties,
          className: [
            'absolute select-none transition-shadow',
            selectedElement === element
              ? 'ring-2 ring-yellow-300 ring-offset-1 rounded'
              : 'hover:ring-1 hover:ring-white/60 rounded',
          ].join(' '),
        }
      : { className: 'absolute' }

  return (
    <div
      className="w-full cursor-pointer"
      style={{ perspective: '1200px', aspectRatio: '1.586 / 1' }}
      onClick={() => {
        if (!isEditing) setIsFlipped(f => !f)
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: showingBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >

        {/* ── FRONT FACE ──────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', background: frontBg }}
        >
          {/* Subtle shine overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

          {/* Profile photo — fixed top-left */}
          {profileImage && (
            <div className="absolute top-[6%] left-[5%] z-10">
              <div className="w-[14%] aspect-square rounded-full overflow-hidden border-2 border-white/50 shadow-lg"
                   style={{ minWidth: 44, maxWidth: 72 }}>
                <Image
                  src={profileImage}
                  alt={name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* NFC icon — fixed top-right, always present */}
          <div className="absolute top-[5%] right-[5%] z-10 flex flex-col items-center gap-0.5">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
              <NfcSymbol />
            </div>
            <span className="text-white/70 font-bold tracking-widest"
                  style={{ fontSize: 'clamp(5px, 1.5%, 9px)' }}>
              NFC
            </span>
          </div>

          {/* ── Draggable front elements ──────────────────────────────────── */}

          {/* Name */}
          <div
            {...dragProps('front', 'name')}
            style={{
              ...(dragProps('front', 'name').style || {}),
              left: `${pos.front.name.x}%`,
              top:  `${pos.front.name.y}%`,
            }}
          >
            <p className="text-white font-bold leading-tight drop-shadow-sm"
               style={{ fontSize: scaledFont(13, 4, 22, pos.front.name.scale) }}>
              {name || 'Your Name'}
            </p>
          </div>

          {/* Job title */}
          <div
            {...dragProps('front', 'title')}
            style={{
              ...(dragProps('front', 'title').style || {}),
              left: `${pos.front.title.x}%`,
              top:  `${pos.front.title.y}%`,
            }}
          >
            <p className="text-white/90 font-semibold leading-tight"
               style={{ fontSize: scaledFont(9, 2.6, 14, pos.front.title.scale) }}>
              {title || 'Job Title'}
            </p>
          </div>

          {/* Company */}
          {company && (
            <div
              {...dragProps('front', 'company')}
              style={{
                ...(dragProps('front', 'company').style || {}),
                left: `${pos.front.company.x}%`,
                top:  `${pos.front.company.y}%`,
              }}
            >
              <p className="text-white/80 font-medium"
                 style={{ fontSize: scaledFont(8, 2.3, 12, pos.front.company.scale) }}>
                {company}
              </p>
            </div>
          )}

          {/* Contact (email + phone) */}
          <div
            {...dragProps('front', 'contact')}
            style={{
              ...(dragProps('front', 'contact').style || {}),
              left: `${pos.front.contact.x}%`,
              top:  `${pos.front.contact.y}%`,
              maxWidth: '88%',
            }}
          >
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {email && (
                <span className="flex items-center gap-1 text-white/85"
                      style={{ fontSize: scaledFont(7, 2, 10, pos.front.contact.scale) }}>
                  <Mail className="shrink-0" style={{ width: '1em', height: '1em' }} />
                  <span className="truncate" style={{ maxWidth: '28ch' }}>{email}</span>
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1 text-white/85"
                      style={{ fontSize: scaledFont(7, 2, 10, pos.front.contact.scale) }}>
                  <Phone className="shrink-0" style={{ width: '1em', height: '1em' }} />
                  {phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── BACK FACE ───────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: backBg,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-tl from-white/10 to-transparent pointer-events-none" />

          {/* Company info (name + website) */}
          <div
            {...dragProps('back', 'info')}
            style={{
              ...(dragProps('back', 'info').style || {}),
              left: `${pos.back.info.x}%`,
              top:  `${pos.back.info.y}%`,
              maxWidth: '48%',
            }}
          >
            <p className="text-white font-bold leading-tight"
               style={{ fontSize: scaledFont(9, 2.8, 14, pos.back.info.scale) }}>
              {company || name}
            </p>
            {website && (
              <p className="text-white/75 mt-0.5"
                 style={{ fontSize: scaledFont(7, 2, 10, pos.back.info.scale) }}>
                {website.replace(/^https?:\/\//, '')}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div
            {...dragProps('back', 'qrCode')}
            style={{
              ...(dragProps('back', 'qrCode').style || {}),
              left: `${pos.back.qrCode.x}%`,
              top:  `${pos.back.qrCode.y}%`,
            }}
          >
            <div className="bg-white rounded-xl p-1.5 shadow-lg"
                 style={{ width: 'clamp(72px, 36%, 110px)' }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan to connect"
                  className="w-full h-auto block"
                />
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center rounded">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}
              <p className="text-center text-gray-500 font-medium mt-0.5"
                 style={{ fontSize: scaledFont(5, 1.4, 8, pos.back.qrCode.scale) }}>
                Scan to connect
              </p>
            </div>
          </div>

          {/* About text */}
          {about && (
            <div
              {...dragProps('back', 'about')}
              style={{
                ...(dragProps('back', 'about').style || {}),
                left: `${pos.back.about.x}%`,
                top:  `${pos.back.about.y}%`,
                maxWidth: '48%',
              }}
            >
              <p className="text-white/80 leading-snug"
                 style={{ fontSize: scaledFont(6, 1.8, 9, pos.back.about.scale) }}>
                {about.length > 120 ? about.slice(0, 120) + '…' : about}
              </p>
            </div>
          )}

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div
              {...dragProps('back', 'social')}
              style={{
                ...(dragProps('back', 'social').style || {}),
                left: `${pos.back.social.x}%`,
                top:  `${pos.back.social.y}%`,
              }}
            >
              <div className="flex gap-1.5 flex-wrap">
                {socialLinks.slice(0, 5).map(link => {
                  const Icon = SOCIAL_ICONS[link.platform] || Globe
                  return (
                    <div
                      key={link.platform}
                      className="bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      style={{
                        width:  scaledFont(18, 5, 26, pos.back.social.scale),
                        height: scaledFont(18, 5, 26, pos.back.social.scale),
                      }}
                      title={link.platform}
                    >
                      <Icon className="text-white"
                            style={{ width: '55%', height: '55%' }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Flip hint */}
          {!isEditing && (
            <div className="absolute bottom-[3%] right-[4%] text-white/40"
                 style={{ fontSize: 'clamp(6px, 1.5%, 8px)' }}>
              ← tap to flip
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
