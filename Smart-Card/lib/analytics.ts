import { sql } from './db'

export async function getCardStats(cardId: number) {
  try {
    const result = await sql`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM analytics_events
      WHERE card_id = ${cardId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY event_type
    `
    
    return {
      totalViews: result.find(r => r.event_type === 'profile_view')?.count || 0,
      totalScans: result.find(r => r.event_type === 'qr_scan')?.count || 0,
      totalTaps: result.find(r => r.event_type === 'nfc_tap')?.count || 0,
    }
  } catch (error) {
    console.error('[v0] Error getting card stats:', error)
    throw error
  }
}

export async function getAnalyticsTimeseries(cardId: number, days: number = 30) {
  try {
    const result = await sql`
      SELECT 
        DATE(created_at)::text as date,
        event_type,
        COUNT(*) as count
      FROM analytics_events
      WHERE card_id = ${cardId}
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), event_type
      ORDER BY DATE(created_at) DESC
    `

    // Transform data for chart
    const chartData: Record<string, any> = {}
    
    result.forEach((row: any) => {
      if (!chartData[row.date]) {
        chartData[row.date] = { date: row.date, profile_view: 0, qr_scan: 0, nfc_tap: 0 }
      }
      chartData[row.date][row.event_type] = row.count
    })

    return Object.values(chartData).reverse()
  } catch (error) {
    console.error('[v0] Error getting analytics timeseries:', error)
    throw error
  }
}

export async function getTopLocations(cardId: number, limit: number = 10) {
  try {
    const result = await sql`
      SELECT 
        location,
        COUNT(*) as count
      FROM analytics_events
      WHERE card_id = ${cardId}
        AND location IS NOT NULL
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY location
      ORDER BY count DESC
      LIMIT ${limit}
    `
    
    return result
  } catch (error) {
    console.error('[v0] Error getting top locations:', error)
    throw error
  }
}

export async function getRecentEvents(cardId: number, limit: number = 10) {
  try {
    const result = await sql`
      SELECT 
        id,
        event_type,
        location,
        device_type,
        created_at
      FROM analytics_events
      WHERE card_id = ${cardId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    
    return result
  } catch (error) {
    console.error('[v0] Error getting recent events:', error)
    throw error
  }
}
