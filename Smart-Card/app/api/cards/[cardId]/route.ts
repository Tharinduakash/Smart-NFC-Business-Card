import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getCardById, updateCard, deleteCard } from '@/lib/cards'
import { z } from 'zod'

const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  about: z.string().optional(),
  cardColor: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const cardId = parseInt(params.cardId)
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const session = await auth()
    const card = await getCardById(cardId)

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // Check if user owns this card
    if (session?.user?.id && card.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('[v0] Get card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cardId = parseInt(params.cardId)
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const card = await getCardById(cardId)
    if (!card || card.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const cardData = updateCardSchema.parse(body)

    const updatedCard = await updateCard(cardId, cardData)

    return NextResponse.json(updatedCard)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    console.error('[v0] Update card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cardId = parseInt(params.cardId)
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const card = await getCardById(cardId)
    if (!card || card.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    await deleteCard(cardId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Delete card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
