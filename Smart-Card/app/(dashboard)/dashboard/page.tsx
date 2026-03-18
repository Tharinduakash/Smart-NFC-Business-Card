'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Share2, QrCode } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'

interface Card {
  id: number
  title: string
  company?: string
  email?: string
  phone?: string
  card_color?: string
  created_at: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cards')
      const data = await response.json()
      setCards(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cards',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteCard = async (cardId: number) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setCards(cards.filter((c) => c.id !== cardId))
      toast({
        title: 'Success',
        description: 'Card deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete card',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Cards</h1>
          <p className="text-muted-foreground mt-1">Create and manage your digital business cards</p>
        </div>
        <Link href="/dashboard/cards/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Card
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="mr-2" />
          <span>Loading cards...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No cards yet</h3>
          <p className="text-muted-foreground mb-6">Create your first digital business card to get started</p>
          <Link href="/dashboard/cards/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Card
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-card"
            >
              <div
                className="h-32 p-4 text-white"
                style={{ backgroundColor: card.card_color || '#3366cc' }}
              >
                <h3 className="font-bold text-lg">{card.title}</h3>
                {card.company && <p className="text-sm opacity-90">{card.company}</p>}
              </div>

              <div className="p-4">
                {card.email && (
                  <p className="text-sm text-muted-foreground truncate mb-2">{card.email}</p>
                )}
                {card.phone && (
                  <p className="text-sm text-muted-foreground truncate mb-4">{card.phone}</p>
                )}

                <div className="flex gap-2">
                  <Link href={`/dashboard/cards/${card.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/cards/${card.id}/qr`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </Link>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="px-3 py-2 hover:bg-destructive/10 hover:text-destructive rounded text-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
