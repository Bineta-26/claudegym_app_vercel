// npm run db:setup -> runs db/schema.sql then db/seed.sql against DATABASE_URL. Safe to re-run.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { ensureEnv } from './ensure-env.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

ensureEnv({ requireDb: true })
process.loadEnvFile(path.join(root, '.env'))

// Node 22+ ships a global WebSocket, which the Pool uses for multi-statement SQL files
neonConfig.webSocketConstructor = globalThis.WebSocket

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

try {
  const client = await pool.connect()
  try {
    for (const file of ['schema.sql', 'seed.sql']) {
      process.stdout.write(`▶ Running db/${file} ... `)
      await client.query(readFileSync(path.join(root, 'db', file), 'utf8'))
      console.log('done')
    }
    const { rows } = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM exercises)::int AS exercises,
        (SELECT COUNT(*) FROM classes)::int   AS classes,
        (SELECT COUNT(*) FROM users)::int     AS users
    `)
    console.log('\n✅ Database ready. Row counts:')
    console.table(rows[0])
  } finally {
    client.release()
  }
} catch (err) {
  console.error('\n❌ Database setup failed:', err.message)
  console.error('   Check that DATABASE_URL in .env is the full connection string from the Neon "Connect" window.')
  process.exitCode = 1
} finally {
  await pool.end()
}
