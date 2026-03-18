import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getCardById } from '@/lib/cards'
import { getCardStats, getAnalyticsTimeseries, getTopLocations, getRecentEvents } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId: cardIdStr } = await params
    const cardId = parseInt(cardIdStr)
    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 })
    }

    const card = await getCardById(cardId)
    if (!card || card.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const [stats, timeseries, locations, recentEvents] = await Promise.all([
      getCardStats(cardId),
      getAnalyticsTimeseries(cardId),
      getTopLocations(cardId),
      getRecentEvents(cardId),
    ])

    return NextResponse.json({ stats, timeseries, locations, recentEvents })
  } catch (error) {
    console.error('[v0] Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}