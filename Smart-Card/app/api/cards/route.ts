import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { createCard, getCardsByUserId } from '@/lib/cards'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  // ✅ Allow empty strings for optional email/website
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  about: z.string().optional(),
  cardColor: z.string().optional(),
  gradientStart: z.string().optional(),
  gradientEnd: z.string().optional(),
  gradientAngle: z.string().optional(),
  profileImage: z.string().optional(),
  nfcUrl: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const cardData = cardSchema.parse(body)

    const cleanedData = {
      ...cardData,
      email: cardData.email || undefined,
      website: cardData.website || undefined,
    }

    // Check if user already has a card
    const existing = await getCardsByUserId(session.user.id)
    
    if (existing.length > 0) {
      // Update existing card instead of creating new one
      const { updateCard } = await import('@/lib/cards')
      const updated = await updateCard(existing[0].id, cleanedData)
      return NextResponse.json(updated, { status: 200 })
    }

    const card = await createCard(session.user.id, cleanedData)
    return NextResponse.json(card, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[v0] Zod validation error:', error.errors)
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('[v0] Create card error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cards = await getCardsByUserId(session.user.id)

    return NextResponse.json(cards)
  } catch (error) {
    console.error('[v0] Get cards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
