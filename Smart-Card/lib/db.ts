import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// ─── Single-call initializer ─────────────────────────────────────────────────
// All DDL is batched into ONE DO $$ block = ONE HTTP round-trip to Neon.
// Previously 20+ sequential awaits → ~11 s cold start.
// Now 1 await → ~1-2 s cold start.

export async function initializeDatabase() {
  await sql`
    DO $$
    BEGIN

      -- ── users ──────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        username      VARCHAR(255),
        first_name    VARCHAR(255),
        last_name     VARCHAR(255),
        company_name  VARCHAR(255),
        profile_image TEXT,
        bio           TEXT,
        location      VARCHAR(255),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Safely add any columns missing from older schema
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username      VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name    VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name     VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name  VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio           TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location      VARCHAR(255);

      -- Migrate old "password" column → "password_hash" (runs only once)
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password'
      ) THEN
        EXECUTE 'UPDATE users SET password_hash = password WHERE password_hash IS NULL';
        ALTER TABLE users DROP COLUMN password;
      END IF;

      -- ── business_cards ─────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS business_cards (
        id                   SERIAL PRIMARY KEY,
        user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name                 VARCHAR(255),
        title                VARCHAR(255) NOT NULL,
        company              VARCHAR(255),
        phone                VARCHAR(30),
        email                VARCHAR(255),
        website              VARCHAR(500),
        about                TEXT,
        card_color           VARCHAR(7)  DEFAULT '#3366cc',
        gradient_start       VARCHAR(7),
        gradient_end         VARCHAR(7),
        gradient_angle       VARCHAR(50),
        front_gradient_start VARCHAR(7),
        front_gradient_end   VARCHAR(7),
        front_gradient_angle VARCHAR(50),
        back_gradient_start  VARCHAR(7),
        back_gradient_end    VARCHAR(7),
        back_gradient_angle  VARCHAR(50),
        profile_image        TEXT,
        nfc_url              VARCHAR(500),
        element_positions    JSONB,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS name              VARCHAR(255);
      ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS element_positions JSONB;
      ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS nfc_url           VARCHAR(500);

      -- ── social_links ───────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS social_links (
        id         SERIAL PRIMARY KEY,
        card_id    INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        platform   VARCHAR(50)  NOT NULL,
        url        VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ── analytics_events ───────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS analytics_events (
        id          SERIAL PRIMARY KEY,
        card_id     INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        event_type  VARCHAR(50) NOT NULL,
        ip_address  VARCHAR(45),
        user_agent  TEXT,
        device_type VARCHAR(50),
        location    VARCHAR(255),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ── subscriptions ──────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS subscriptions (
        id                      SERIAL PRIMARY KEY,
        user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan                    VARCHAR(50) DEFAULT 'free',
        stripe_customer_id      VARCHAR(255),
        stripe_subscription_id  VARCHAR(255),
        status                  VARCHAR(50) DEFAULT 'active',
        current_period_start    TIMESTAMP,
        current_period_end      TIMESTAMP,
        created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ── indexes ────────────────────────────────────────────────────────
      CREATE INDEX IF NOT EXISTS idx_business_cards_user_id  ON business_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_social_links_card_id    ON social_links(card_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_card_id       ON analytics_events(card_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id   ON subscriptions(user_id);

    END $$
  `
  console.log('[db] initialized')
}

// ─── Singleton guard ─────────────────────────────────────────────────────────
// Runs initializeDatabase() only ONCE per process/worker lifetime.
// Subsequent calls are instant (no DB round-trip).
let _done    = false
let _promise: Promise<void> | null = null

export async function ensureDatabase(): Promise<void> {
  if (_done) return
  if (!_promise) {
    _promise = initializeDatabase()
      .then(() => { _done = true })
      .catch(err => {
        // Reset so the next request can retry
        _promise = null
        throw err
      })
  }
  await _promise
}
