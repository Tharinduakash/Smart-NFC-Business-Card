import { sql } from './db'
import QRCode from 'qrcode'

export async function createCard(userId: number, cardData: {
  title: string
  company?: string
  phone?: string
  email?: string
  website?: string
  about?: string
  cardColor?: string
  socialLinks?: Array<{ platform: string; url: string }>
}) {
  try {
    const result = await sql`
      INSERT INTO business_cards (user_id, title, company, phone, email, website, about, card_color)
      VALUES (${userId}, ${cardData.title}, ${cardData.company || null}, ${cardData.phone || null}, 
              ${cardData.email || null}, ${cardData.website || null}, ${cardData.about || null}, 
              ${cardData.cardColor || '#ffffff'})
      RETURNING *
    `
    const card = result[0]

    // Insert social links if provided
    if (cardData.socialLinks && cardData.socialLinks.length > 0) {
      for (const link of cardData.socialLinks) {
        await sql`
          INSERT INTO social_links (card_id, platform, url)
          VALUES (${card.id}, ${link.platform}, ${link.url})
        `
      }
    }

    return card
  } catch (error) {
    console.error('[v0] Error creating card:', error)
    throw error
  }
}

export async function getCardById(cardId: number) {
  try {
    const cardResult = await sql`
      SELECT * FROM business_cards WHERE id = ${cardId}
    `
    if (cardResult.length === 0) return null

    const card = cardResult[0]
    const socialLinksResult = await sql`
      SELECT platform, url FROM social_links WHERE card_id = ${cardId}
    `

    return {
      ...card,
      socialLinks: socialLinksResult,
    }
  } catch (error) {
    console.error('[v0] Error getting card:', error)
    throw error
  }
}

export async function getCardsByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM business_cards WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error('[v0] Error getting user cards:', error)
    throw error
  }
}

export async function updateCard(cardId: number, cardData: {
  title?: string
  company?: string
  phone?: string
  email?: string
  website?: string
  about?: string
  cardColor?: string
}) {
  try {
    const updates = []
    const values = []

    if (cardData.title !== undefined) {
      updates.push(`title = $${updates.length + 1}`)
      values.push(cardData.title)
    }
    if (cardData.company !== undefined) {
      updates.push(`company = $${updates.length + 1}`)
      values.push(cardData.company)
    }
    if (cardData.phone !== undefined) {
      updates.push(`phone = $${updates.length + 1}`)
      values.push(cardData.phone)
    }
    if (cardData.email !== undefined) {
      updates.push(`email = $${updates.length + 1}`)
      values.push(cardData.email)
    }
    if (cardData.website !== undefined) {
      updates.push(`website = $${updates.length + 1}`)
      values.push(cardData.website)
    }
    if (cardData.about !== undefined) {
      updates.push(`about = $${updates.length + 1}`)
      values.push(cardData.about)
    }
    if (cardData.cardColor !== undefined) {
      updates.push(`card_color = $${updates.length + 1}`)
      values.push(cardData.cardColor)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updates.length === 1) return null

    const result = await sql`
      UPDATE business_cards
      SET ${updates.join(', ')}
      WHERE id = ${cardId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('[v0] Error updating card:', error)
    throw error
  }
}

export async function deleteCard(cardId: number) {
  try {
    await sql`DELETE FROM business_cards WHERE id = ${cardId}`
    return true
  } catch (error) {
    console.error('[v0] Error deleting card:', error)
    throw error
  }
}

export async function generateQRCode(text: string) {
  try {
    const qrCode = await QRCode.toDataURL(text)
    return qrCode
  } catch (error) {
    console.error('[v0] Error generating QR code:', error)
    throw error
  }
}

export async function trackAnalyticsEvent(cardId: number, eventType: string, req: any) {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0]
    const userAgent = req.headers['user-agent']

    await sql`
      INSERT INTO analytics_events (card_id, event_type, ip_address, user_agent)
      VALUES (${cardId}, ${eventType}, ${ipAddress}, ${userAgent})
    `
  } catch (error) {
    console.error('[v0] Error tracking analytics:', error)
    // Don't throw - analytics tracking should not break the app
  }
}

export async function getCardAnalytics(cardId: number, days: number = 30) {
  try {
    const result = await sql`
      SELECT 
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM analytics_events
      WHERE card_id = ${cardId}
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), event_type
      ORDER BY DATE(created_at) DESC
    `
    return result
  } catch (error) {
    console.error('[v0] Error getting analytics:', error)
    throw error
  }
}
