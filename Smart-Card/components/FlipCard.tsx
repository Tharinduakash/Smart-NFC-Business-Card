'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createGradientStyle } from '@/lib/gradients'
import { Wifi } from 'lucide-react'

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

  const backgroundStyle = gradientStart && gradientEnd
    ? { background: `linear-gradient(${gradientAngle || '45deg'}, ${gradientStart}, ${gradientEnd})` }
    : { backgroundColor: cardColor || '#3366cc' }

  return (
    <div
      className="w-full max-w-2xl cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: '1000px',
        aspectRatio: '16 / 10',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full rounded-3xl shadow-2xl p-8 flex flex-row items-center justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            ...backgroundStyle,
          }}
        >
          {/* Left Section - Profile & Info */}
          <div className="flex items-center gap-6 flex-1 z-10">
            {/* Profile Image */}
            {profileImage && (
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/30">
                  <Image
                    src={profileImage}
                    alt={title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Text Info */}
            <div className="text-white flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-1 truncate">{title}</h2>
              {company && <p className="text-sm opacity-90 mb-3 truncate">{company}</p>}

              {/* Contact Info */}
              <div className="space-y-1 text-xs opacity-85">
                {email && <p className="truncate">{email}</p>}
                {phone && <p className="truncate">{phone}</p>}
              </div>
            </div>
          </div>

          {/* Right Section - NFC Icon */}
          <div className="flex-shrink-0 ml-4 z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center">
              <Wifi className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-white/70 text-xs text-center mt-2 font-medium">NFC</p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute w-full h-full rounded-3xl shadow-2xl p-8 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            ...backgroundStyle,
          }}
        >
          {/* Top Section - Branding */}
          <div className="text-white z-10">
            <p className="text-sm font-semibold opacity-90">{title}</p>
            {company && <p className="text-xs opacity-75">{company}</p>}
          </div>

          {/* Bottom Right - QR Code */}
          <div className="absolute bottom-6 right-6 z-10">
            {qrData && (
              <img
                src={qrData}
                alt="QR Code"
                className="w-20 h-20"
                style={{
                  filter: 'brightness(0) invert(1)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
