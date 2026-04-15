import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS business_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        about TEXT,
        card_color VARCHAR(7) DEFAULT '#ffffff',
        gradient_start VARCHAR(7),
        gradient_end VARCHAR(7),
        gradient_angle VARCHAR(50),
        front_gradient_start VARCHAR(7),
        front_gradient_end VARCHAR(7),
        front_gradient_angle VARCHAR(50),
        back_gradient_start VARCHAR(7),
        back_gradient_end VARCHAR(7),
        back_gradient_angle VARCHAR(50),
        profile_image VARCHAR(255),
        nfc_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_type VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(50) DEFAULT 'free',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_social_links_card_id ON social_links(card_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_card_id ON analytics_events(card_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`

    console.log('[v0] Database initialized successfully')
  } catch (error) {
    console.error('[v0] Database initialization error:', error)
    throw error
  }
}
