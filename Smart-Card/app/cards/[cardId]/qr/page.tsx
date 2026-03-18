'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function QRCodePage() {
  const params = useParams()
  const cardId = params.cardId as string
  const { toast } = useToast()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${cardId}`

  useEffect(() => {
    generateQR()
  }, [cardId])

  const generateQR = async () => {
    try {
      setLoading(true)
      const qr = await QRCode.toDataURL(profileUrl)
      setQrDataUrl(qr)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = async () => {
    if (!qrDataUrl) return

    try {
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = `smartcard-${cardId}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: 'Success',
        description: 'QR code downloaded',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      })
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: 'Success',
      description: 'Profile link copied to clipboard',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">Share Your Card</h1>
          <p className="text-muted-foreground text-center mb-8">
            Use the QR code below or share the link
          </p>

          {/* QR Code Display */}
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg mb-8">
              <p className="text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrDataUrl ? (
            <div className="flex flex-col items-center mb-8">
              <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  width={256}
                  height={256}
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Scan this QR code to view your digital business card
              </p>
            </div>
          ) : null}

          {/* Share Link */}
          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <label className="text-sm font-semibold text-foreground block mb-3">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={profileUrl}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
              />
              <Button onClick={copyLink} variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button onClick={downloadQR} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
            <Button
              onClick={() => {
                const text = `Check out my digital business card: ${profileUrl}`
                navigator.share?.({ title: 'My Business Card', text })
              }}
              variant="outline"
              className="flex-1"
            >
              Share
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Tips for sharing:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Print the QR code and add it to your email signature</li>
              <li>✓ Share the link on your social media profiles</li>
              <li>✓ Add the QR code to your physical business cards</li>
              <li>✓ Send the link during video calls or networking events</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
