'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Plus, Edit2, Trash2, Share2, Wifi, QrCode,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'
import BusinessCard from '@/components/BusinessCard'

interface SocialLink { platform: string; url: string }

interface Card {
  id: number
  name?: string
  title: string
  company?: string
  email?: string
  phone?: string
  website?: string
  about?: string
  profile_image?: string
  card_color?: string
  front_gradient_start?: string
  front_gradient_end?: string
  front_gradient_angle?: string
  back_gradient_start?: string
  back_gradient_end?: string
  back_gradient_angle?: string
  nfc_url?: string
  element_positions?: Record<string, unknown>
  social_links?: SocialLink[]
  created_at: string
}

async function writeNFCTag(url: string): Promise<{ ok: boolean; message: string }> {
  if (!('NDEFReader' in window)) {
    return {
      ok: false,
      message: 'Web NFC is only supported in Chrome on Android. Use the QR code on other devices.',
    }
  }
  try {
    // @ts-ignore – NDEFReader is not yet in TS lib types
    const ndef = new NDEFReader()
    await ndef.write({ records: [{ recordType: 'url', data: url }] })
    return { ok: true, message: 'NFC tag written! Your physical card is ready.' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, message: `NFC write failed: ${msg}` }
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [cards, setCards]     = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [nfcLoading, setNfcLoading] = useState<number | null>(null)

  useEffect(() => { fetchCards() }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const res  = await fetch('/api/cards')
      const data = await res.json()
      setCards(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load cards', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const deleteCard = async (cardId: number) => {
    if (!confirm('Delete this card? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCards(prev => prev.filter(c => c.id !== cardId))
      toast({ title: 'Deleted', description: 'Card removed successfully.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete card', variant: 'destructive' })
    }
  }

  const handleNFCWrite = async (card: Card) => {
    const url = card.nfc_url || `${window.location.origin}/u/${session?.user?.id}`
    setNfcLoading(card.id)
    const result = await writeNFCTag(url)
    setNfcLoading(null)
    toast({
      title:       result.ok ? 'NFC Tag Written' : 'NFC Not Available',
      description: result.message,
      variant:     result.ok ? 'default' : 'destructive',
    })
  }

  const cardName = (card: Card) =>
    card.name || session?.user?.name || 'Your Name'

  const FREE_LIMIT = 3

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Cards</h1>
          <p className="text-muted-foreground mt-1">
            {cards.length}/{FREE_LIMIT} cards used on free plan
          </p>
        </div>
        <Link href="/dashboard/cards/new">
          <Button disabled={cards.length >= FREE_LIMIT}>
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
        </Link>
      </div>

      {/* Plan banner */}
      {cards.length >= FREE_LIMIT && (
        <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            Free plan limit reached ({FREE_LIMIT} cards).
          </p>
          <Link href="/dashboard/upgrade">
            <Button size="sm" variant="outline" className="text-amber-700 border-amber-400 hover:bg-amber-100">
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="mr-2" />
          <span className="text-muted-foreground">Loading cards…</span>
        </div>

      /* Empty state */
      ) : cards.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No cards yet</h3>
          <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
            Create your first smart business card. Fill in your details and get a
            shareable link, QR code, and NFC-ready profile instantly.
          </p>
          <Link href="/dashboard/cards/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Card
            </Button>
          </Link>
        </div>

      /* Card grid */
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.map(card => (
            <div
              key={card.id}
              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Card preview */}
              <div className="p-5 pb-3 bg-muted/30">
                <BusinessCard
                  name={cardName(card)}
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
                  nfcUrl={card.nfc_url}
                  socialLinks={card.social_links}
                  elementPositions={card.element_positions as any}
                />
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Click card to flip
                </p>
              </div>

              {/* Card info */}
              <div className="px-5 py-3 border-t border-border">
                <p className="font-semibold text-foreground truncate">{cardName(card)}</p>
                <p className="text-sm text-muted-foreground truncate">{card.title}{card.company ? ` · ${card.company}` : ''}</p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                <Link href={`/dashboard/cards/${card.id}/edit`} className="col-span-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                    Edit Design
                  </Button>
                </Link>

                <Link href={`/cards/${card.id}/qr`} className="col-span-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="col-span-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                  onClick={() => handleNFCWrite(card)}
                  disabled={nfcLoading === card.id}
                >
                  {nfcLoading === card.id
                    ? <Spinner className="mr-1.5 w-3.5 h-3.5" />
                    : <Wifi className="w-3.5 h-3.5 mr-1.5" />}
                  Write NFC
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="col-span-1 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteCard(card.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
