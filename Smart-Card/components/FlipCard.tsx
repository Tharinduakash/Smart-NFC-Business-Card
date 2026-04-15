'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createGradientStyle } from '@/lib/gradients'
import { Smartphone } from 'lucide-react'

interface FlipCardProps {
  title: string
  company?: string
  email?: string
  phone?: string
  website?: string
  about?: string
  profileImage?: string
  cardColor?: string
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: string
  frontGradientStart?: string
  frontGradientEnd?: string
  frontGradientAngle?: string
  backGradientStart?: string
  backGradientEnd?: string
  backGradientAngle?: string
  nfcUrl?: string
  qrCodeUrl?: string
}

export default function FlipCard({
  title,
  company,
  email,
  phone,
  website,
  about,
  profileImage,
  cardColor,
  gradientStart,
  gradientEnd,
  gradientAngle,
  frontGradientStart,
  frontGradientEnd,
  frontGradientAngle,
  backGradientStart,
  backGradientEnd,
  backGradientAngle,
  nfcUrl,
  qrCodeUrl,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [qrData, setQrData] = useState<string | null>(qrCodeUrl || null)

  useEffect(() => {
    const loadQrCode = async () => {
      if (!qrCodeUrl && nfcUrl) {
        try {
          const response = await fetch(`/api/qr?url=${encodeURIComponent(nfcUrl)}`)
          if (response.ok) {
            const data = await response.json()
            setQrData(data.qrCode)
          }
        } catch (error) {
          console.error('[v0] Failed to load QR code:', error)
        }
      }
    }
    loadQrCode()
  }, [nfcUrl, qrCodeUrl])

  // Use separate gradients for front/back, fallback to single gradient
  const frontBackground = (frontGradientStart && frontGradientEnd)
    ? { background: `linear-gradient(${frontGradientAngle || '135deg'}, ${frontGradientStart}, ${frontGradientEnd})` }
    : (gradientStart && gradientEnd)
    ? { background: `linear-gradient(${gradientAngle || '45deg'}, ${gradientStart}, ${gradientEnd})` }
    : { backgroundColor: cardColor || '#3366cc' }

  const backBackground = (backGradientStart && backGradientEnd)
    ? { background: `linear-gradient(${backGradientAngle || '135deg'}, ${backGradientStart}, ${backGradientEnd})` }
    : (gradientStart && gradientEnd)
    ? { background: `linear-gradient(${gradientAngle || '45deg'}, ${gradientStart}, ${gradientEnd})` }
    : { backgroundColor: cardColor || '#3366cc' }

  return (
    <div
      className="w-full max-w-md cursor-pointer mx-auto"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: '1000px',
        aspectRatio: '1.6 / 1',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side - Credit Card Style */}
        <div
          className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden text-white"
          style={{
            backfaceVisibility: 'hidden',
            ...frontBackground,
          }}
        >
          {/* Top Section - Profile Image & NFC Icon */}
          <div className="flex items-start justify-between">
            {/* Profile Image - Minimal Border */}
            {profileImage && (
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/40">
                  <Image
                    src={profileImage}
                    alt={title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* NFC Icon - Top Right */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Smartphone className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold text-white/80">NFC</p>
            </div>
          </div>

          {/* Middle Section - Name & Title */}
          <div>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">{title}</h2>
            {company && (
              <p className="text-sm font-medium text-white/90">{company}</p>
            )}
          </div>

          {/* Bottom Section - Contact Info */}
          <div className="space-y-1 text-xs font-medium text-white/85">
            {email && (
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span className="truncate">{website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Back Side - QR Code */}
        <div
          className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between items-center overflow-hidden text-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            ...backBackground,
          }}
        >
          {/* Top - Company Branding */}
          <div className="text-center mt-2 z-10">
            <p className="text-sm font-bold opacity-95 tracking-wide">{title}</p>
            {company && (
              <p className="text-xs font-medium opacity-75">{company}</p>
            )}
          </div>

          {/* QR Code - Bottom Right Position */}
          <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg p-2">
            {qrData ? (
              <img
                src={qrData}
                alt="QR Code"
                className="w-24 h-24"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 flex items-center justify-center">
                <span className="text-xs text-white/60">Loading...</span>
              </div>
            )}
          </div>

          {/* Center - Website or About */}
          <div className="text-center opacity-85 z-10">
            {website && (
              <p className="text-xs mb-2">{website}</p>
            )}
            {about && (
              <p className="text-xs italic opacity-75 max-w-xs">{about}</p>
            )}
            {!website && !about && (
              <p className="text-xs opacity-75">Scan QR to view full profile</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
