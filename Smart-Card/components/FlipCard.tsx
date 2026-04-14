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
    ? { background: createGradientStyle(gradientStart, gradientEnd, gradientAngle || '45deg') }
    : { backgroundColor: cardColor || '#3366cc' }

  return (
    <div
      className="h-96 cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: '1000px',
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
          className="absolute w-full h-full bg-card rounded-2xl shadow-xl p-8 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            ...backgroundStyle,
          }}
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative z-10">
            {/* Profile Image */}
            {profileImage && (
              <div className="mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
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

            {/* Main Info */}
            <h2 className="text-3xl font-bold text-white mb-1">{title}</h2>
            {company && <p className="text-lg text-white/90 mb-2">{company}</p>}

            {/* NFC Icon */}
            {nfcUrl && (
              <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                <Wifi className="w-4 h-4" />
                <span>NFC Enabled</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-1 text-sm text-white/80 mt-4">
              {email && <p>📧 {email}</p>}
              {phone && <p>📱 {phone}</p>}
              {website && <p>🌐 {website.replace(/^https?:\/\/(www\.)?/, '')}</p>}
            </div>
          </div>

          {/* Flip indicator */}
          <div className="relative z-10 text-center">
            <p className="text-xs text-white/60">Tap to flip</p>
          </div>
        </div>

        {/* Back Side - QR Code */}
        <div
          className="absolute w-full h-full bg-card rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              ...backgroundStyle,
              opacity: 0.1,
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-4">
            {qrData ? (
              <>
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={qrData}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Scan to view profile</p>
                  <p className="text-xs text-muted-foreground">SmartCard</p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">QR Code will appear here</p>
              </div>
            )}
          </div>

          {/* Flip indicator */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-xs text-muted-foreground">Tap to flip back</p>
          </div>
        </div>
      </div>
    </div>
  )
}
