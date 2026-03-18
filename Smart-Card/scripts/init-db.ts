import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local before anything else
config({ path: resolve(process.cwd(), '.env.local') })

import { initializeDatabase } from '../lib/db'

async function main() {
  console.log('🔧 Initializing database...')
  await initializeDatabase()
  console.log('✅ Database ready!')
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Failed:', e)
  process.exit(1)
})