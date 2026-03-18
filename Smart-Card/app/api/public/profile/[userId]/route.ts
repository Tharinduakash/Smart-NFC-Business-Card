import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { trackAnalyticsEvent } from '@/lib/cards'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Get user data
    const userResult = await sql`
      SELECT id, email, name, profile_image, bio, location
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get primary card (first card created)
    const cardResult = await sql`
      SELECT *
      FROM business_cards
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
      LIMIT 1
    `

    let card = null
    if (cardResult.length > 0) {
      card = cardResult[0]
      // Get social links
      const socialLinksResult = await sql`
        SELECT platform, url
        FROM social_links
        WHERE card_id = ${card.id}
      `
      card.socialLinks = socialLinksResult
      
      // Track the view
      await trackAnalyticsEvent(card.id, 'profile_view', request)
    }

    return NextResponse.json({
      user: userResult[0],
      card,
    })
  } catch (error) {
    console.error('[v0] Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
