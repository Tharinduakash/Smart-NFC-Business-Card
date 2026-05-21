import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getCardById, updateCard, updateSocialLinks, deleteCard } from '@/lib/cards'
import { z } from 'zod'

const positionSchema = z.object({ x: z.number(), y: z.number(), scale: z.number().optional() }).optional()

const updateSchema = z.object({
  name:    z.string().optional(),
  title:   z.string().min(1).optional(),
  company: z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  about:   z.string().optional(),
  cardColor:           z.string().optional(),
  gradientStart:       z.string().optional(),
  gradientEnd:         z.string().optional(),
  gradientAngle:       z.string().optional(),
  frontGradientStart:  z.string().optional(),
  frontGradientEnd:    z.string().optional(),
  frontGradientAngle:  z.string().optional(),
  backGradientStart:   z.string().optional(),
  backGradientEnd:     z.string().optional(),
  backGradientAngle:   z.string().optional(),
  profileImage:        z.string().optional(),
  nfcUrl:              z.string().optional(),
  elementPositions: z.object({
    front: z.object({
      name:    positionSchema,
      title:   positionSchema,
      company: positionSchema,
      contact: positionSchema,
    }).optional(),
    back: z.object({
      info:    positionSchema,
      qrCode:  positionSchema,
      about:   positionSchema,
      social:  positionSchema,
    }).optional(),
  }).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url:      z.string().url(),
  })).optional(),
})

type Params = { params: Promise<{ cardId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { cardId: str } = await params
    const cardId = parseInt(str)
    if (isNaN(cardId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const session = await auth()
    const card    = await getCardById(cardId)
    if (!card)    return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session?.user?.id && String(card.user_id) !== String(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('[api/cards/:id] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { cardId: str } = await params
    const cardId = parseInt(str)
    if (isNaN(cardId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const card = await getCardById(cardId)
    if (!card || String(card.user_id) !== String(session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body    = await request.json()
    const payload = updateSchema.parse(body)

    const { socialLinks, ...cardFields } = payload

    const updatedCard = await updateCard(cardId, {
      ...cardFields,
      email:   cardFields.email   || undefined,
      website: cardFields.website || undefined,
    })

    if (socialLinks !== undefined) {
      await updateSocialLinks(cardId, socialLinks)
    }

    return NextResponse.json(updatedCard)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('[api/cards/:id] PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { cardId: str } = await params
    const cardId = parseInt(str)
    if (isNaN(cardId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const card = await getCardById(cardId)
    if (!card || String(card.user_id) !== String(session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await deleteCard(cardId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/cards/:id] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
