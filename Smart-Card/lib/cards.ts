import { sql } from './db'

export interface ElementPosition {
  x: number
  y: number
  scale?: number
}

export interface ElementPositions {
  front?: {
    name?:    ElementPosition
    title?:   ElementPosition
    company?: ElementPosition
    contact?: ElementPosition
  }
  back?: {
    info?:   ElementPosition
    qrCode?: ElementPosition
    social?: ElementPosition
    about?:  ElementPosition
  }
}

export interface CardData {
  name?: string
  title: string
  company?: string
  phone?: string
  email?: string
  website?: string
  about?: string
  cardColor?: string
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: string
  frontGradientStart?: string
  frontGradientEnd?: string
  frontGradientAngle?: string
  backGradientStart?: string
  backGradientEnd?: string
  backGradientAngle?: string
  profileImage?: string
  nfcUrl?: string
  elementPositions?: ElementPositions
  socialLinks?: Array<{ platform: string; url: string }>
}

export async function createCard(userId: string, cardData: CardData) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const nfcUrl = cardData.nfcUrl || `${appUrl}/u/${userId}`

    const result = await sql`
      INSERT INTO business_cards (
        user_id, name, title, company, phone, email, website, about, card_color,
        gradient_start, gradient_end, gradient_angle,
        front_gradient_start, front_gradient_end, front_gradient_angle,
        back_gradient_start, back_gradient_end, back_gradient_angle,
        profile_image, nfc_url, element_positions
      )
      VALUES (
        ${userId},
        ${cardData.name || null},
        ${cardData.title},
        ${cardData.company || null},
        ${cardData.phone || null},
        ${cardData.email || null},
        ${cardData.website || null},
        ${cardData.about || null},
        ${cardData.cardColor || '#3366cc'},
        ${cardData.gradientStart || null},
        ${cardData.gradientEnd || null},
        ${cardData.gradientAngle || null},
        ${cardData.frontGradientStart || null},
        ${cardData.frontGradientEnd || null},
        ${cardData.frontGradientAngle || null},
        ${cardData.backGradientStart || null},
        ${cardData.backGradientEnd || null},
        ${cardData.backGradientAngle || null},
        ${cardData.profileImage || null},
        ${nfcUrl},
        ${cardData.elementPositions ? JSON.stringify(cardData.elementPositions) : null}
      )
      RETURNING *
    `
    const card = result[0]

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
    console.error('[db] Error creating card:', error)
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
    const socialLinks = await sql`
      SELECT platform, url FROM social_links WHERE card_id = ${cardId} ORDER BY id ASC
    `

    return { ...card, socialLinks }
  } catch (error) {
    console.error('[db] Error getting card:', error)
    throw error
  }
}

export async function getCardsByUserId(userId: string) {
  try {
    const cards = await sql`
      SELECT bc.*,
        COALESCE(
          json_agg(json_build_object('platform', sl.platform, 'url', sl.url) ORDER BY sl.id)
          FILTER (WHERE sl.id IS NOT NULL),
          '[]'
        ) AS social_links
      FROM business_cards bc
      LEFT JOIN social_links sl ON sl.card_id = bc.id
      WHERE bc.user_id = ${userId}
      GROUP BY bc.id
      ORDER BY bc.created_at DESC
    `
    return cards
  } catch (error) {
    console.error('[db] Error getting user cards:', error)
    throw error
  }
}

export async function updateCard(cardId: number, cardData: Partial<CardData>) {
  try {
    const result = await sql`
      UPDATE business_cards
      SET
        name                 = COALESCE(${cardData.name                 ?? null}, name),
        title                = COALESCE(${cardData.title                ?? null}, title),
        company              = COALESCE(${cardData.company              ?? null}, company),
        phone                = COALESCE(${cardData.phone                ?? null}, phone),
        email                = COALESCE(${cardData.email                ?? null}, email),
        website              = COALESCE(${cardData.website              ?? null}, website),
        about                = COALESCE(${cardData.about                ?? null}, about),
        card_color           = COALESCE(${cardData.cardColor           ?? null}, card_color),
        gradient_start       = COALESCE(${cardData.gradientStart       ?? null}, gradient_start),
        gradient_end         = COALESCE(${cardData.gradientEnd         ?? null}, gradient_end),
        gradient_angle       = COALESCE(${cardData.gradientAngle       ?? null}, gradient_angle),
        front_gradient_start = COALESCE(${cardData.frontGradientStart ?? null}, front_gradient_start),
        front_gradient_end   = COALESCE(${cardData.frontGradientEnd   ?? null}, front_gradient_end),
        front_gradient_angle = COALESCE(${cardData.frontGradientAngle ?? null}, front_gradient_angle),
        back_gradient_start  = COALESCE(${cardData.backGradientStart  ?? null}, back_gradient_start),
        back_gradient_end    = COALESCE(${cardData.backGradientEnd    ?? null}, back_gradient_end),
        back_gradient_angle  = COALESCE(${cardData.backGradientAngle  ?? null}, back_gradient_angle),
        profile_image        = COALESCE(${cardData.profileImage        ?? null}, profile_image),
        nfc_url              = COALESCE(${cardData.nfcUrl              ?? null}, nfc_url),
        element_positions    = COALESCE(${
          cardData.elementPositions != null
            ? JSON.stringify(cardData.elementPositions)
            : null
        }, element_positions),
        updated_at           = CURRENT_TIMESTAMP
      WHERE id = ${cardId}
      RETURNING *
    `
    return result[0] ?? null
  } catch (error) {
    console.error('[db] Error updating card:', error)
    throw error
  }
}

export async function updateSocialLinks(
  cardId: number,
  socialLinks: Array<{ platform: string; url: string }>
) {
  try {
    await sql`DELETE FROM social_links WHERE card_id = ${cardId}`
    for (const link of socialLinks) {
      await sql`
        INSERT INTO social_links (card_id, platform, url)
        VALUES (${cardId}, ${link.platform}, ${link.url})
      `
    }
  } catch (error) {
    console.error('[db] Error updating social links:', error)
    throw error
  }
}

export async function deleteCard(cardId: number) {
  try {
    await sql`DELETE FROM business_cards WHERE id = ${cardId}`
    return true
  } catch (error) {
    console.error('[db] Error deleting card:', error)
    throw error
  }
}

export async function trackAnalyticsEvent(
  cardId: number,
  eventType: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await sql`
      INSERT INTO analytics_events (card_id, event_type, ip_address, user_agent)
      VALUES (${cardId}, ${eventType}, ${ipAddress || null}, ${userAgent || null})
    `
  } catch {
    // Analytics should never break the app
  }
}
