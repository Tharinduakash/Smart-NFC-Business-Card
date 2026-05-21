import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { createCard, getCardsByUserId } from '@/lib/cards'
import { z } from 'zod'

const positionSchema = z.object({ x: z.number(), y: z.number(), scale: z.number().optional() }).optional()

const cardSchema = z.object({
  name:    z.string().optional(),
  title:   z.string().min(1, 'Job title is required'),
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

const FREE_CARD_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body     = await request.json()
    const cardData = cardSchema.parse(body)

    const existing = await getCardsByUserId(session.user.id)
    if (existing.length >= FREE_CARD_LIMIT) {
      return NextResponse.json(
        { error: `Free plan allows up to ${FREE_CARD_LIMIT} cards. Upgrade to create more.` },
        { status: 403 }
      )
    }

    const card = await createCard(session.user.id, {
      ...cardData,
      email:   cardData.email   || undefined,
      website: cardData.website || undefined,
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('[api/cards] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const cards = await getCardsByUserId(session.user.id)
    return NextResponse.json(cards)
  } catch (error) {
    console.error('[api/cards] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
