'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createGradientStyle } from '@/lib/gradients'
import { NFCIcon } from './NFCIcon'

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
          className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden text-white font-inter"
          style={{
            backfaceVisibility: 'hidden',
            ...frontBackground,
          }}
        >
          {/* Top Section - Profile Image & NFC Icon */}
          <div className="flex items-start justify-between gap-4">
            {/* Profile Image - Minimal Border */}
            {profileImage ? (
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/30 shadow-lg">
                  <Image
                    src={profileImage}
                    alt={title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                <span className="text-2xl font-poppins font-bold">
                  {title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* NFC Icon - Top Right Corner */}
            <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
              <NFCIcon className="w-7 h-7 text-white drop-shadow-lg" />
              <p className="text-[10px] font-poppins font-semibold text-white/70 tracking-wide">NFC</p>
            </div>
          </div>

          {/* Middle Section - Name & Title & Company */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <h2 className="text-2xl font-poppins font-bold tracking-tight leading-tight mb-1">
              {title}
            </h2>
            {company && (
              <p className="text-sm font-inter font-medium text-white/85 leading-snug">
                {company}
              </p>
            )}
          </div>

          {/* Bottom Section - Contact Info */}
          <div className="space-y-2 text-xs font-inter text-white/80 leading-relaxed">
            {email && (
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-sm flex-shrink-0">✉</span>
                <span className="truncate font-light">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2.5">
                <span className="text-sm flex-shrink-0">☎</span>
                <span className="font-light">{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-sm flex-shrink-0">🌐</span>
                <span className="truncate font-light">{website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Back Side - QR Code */}
        <div
          className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between items-center overflow-hidden text-white font-inter"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            ...backBackground,
          }}
        >
          {/* Top - Company Branding */}
          <div className="text-center z-10 flex-shrink-0">
            <p className="text-lg font-poppins font-bold opacity-95 tracking-tight leading-tight mb-0.5">
              {title}
            </p>
            {company && (
              <p className="text-xs font-inter font-medium opacity-80 leading-tight">
                {company}
              </p>
            )}
          </div>

          {/* Center - Website or About */}
          <div className="text-center opacity-85 z-10 flex-1 flex items-center justify-center px-4">
            {website && (
              <p className="text-sm font-inter font-light leading-relaxed">{website}</p>
            )}
            {about && (
              <p className="text-xs font-inter font-light italic opacity-80 leading-relaxed">
                {about}
              </p>
            )}
            {!website && !about && (
              <p className="text-xs font-inter font-light opacity-75">
                Scan QR to view full profile
              </p>
            )}
          </div>

          {/* QR Code - Bottom Right Position */}
          <div className="absolute bottom-5 right-5 z-10 bg-white rounded-xl p-2 shadow-lg flex-shrink-0">
            {qrData ? (
              <img
                src={qrData}
                alt="QR Code"
                className="w-24 h-24 rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white/10 flex items-center justify-center rounded-lg">
                <span className="text-xs font-light text-white/60">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
