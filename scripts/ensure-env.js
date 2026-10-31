// Makes sure .env exists with a JWT_SECRET, and explains how to get DATABASE_URL if it's missing.
// Usage: node scripts/ensure-env.js            -> warns if DATABASE_URL is missing
//        node scripts/ensure-env.js --require-db -> exits with an error if DATABASE_URL is missing
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

export const NEON_HELP = `
  ┌──────────────────────────────────────────────────────────────────────┐
  │  DATABASE_URL is missing. Here's where to get it (free, ~2 minutes): │
  └──────────────────────────────────────────────────────────────────────┘
   1. Go to https://console.neon.tech and sign up / log in.
   2. Create a project (any name, e.g. "pulsefit"); pick the region closest to you.
   3. On the project Dashboard, click the "Connect" button (top right).
   4. In the "Connect to your database" window, keep the defaults
      (branch: production, database: neondb) and copy the connection string.
      It looks like: postgresql://neondb_owner:xxxx@ep-xxxx-pooler.xxxx.neon.tech/neondb?sslmode=require
   5. Open the .env file in the PulseFit folder and paste it after DATABASE_URL=
      (no quotes, no spaces), then save.
   6. Run:  npm run db:setup
`

function parse(text) {
  const vars = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return vars
}

export function ensureEnv({ requireDb = false } = {}) {
  let text = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  const vars = parse(text)
  const additions = []

  if (!('DATABASE_URL' in vars)) additions.push('DATABASE_URL=')
  if (!vars.JWT_SECRET) {
    text = text.replace(/^\s*JWT_SECRET\s*=.*$/m, '').trimEnd()
    additions.push(`JWT_SECRET=${randomBytes(48).toString('base64url')}`)
    console.log('🔐 Generated a strong random JWT_SECRET and saved it to .env')
  }
  if (additions.length) {
    writeFileSync(envPath, (text ? text.trimEnd() + '\n' : '') + additions.join('\n') + '\n')
  }

  const hasDb = Boolean(parse(readFileSync(envPath, 'utf8')).DATABASE_URL)
  if (!hasDb) {
    console.log(NEON_HELP)
    if (requireDb) process.exit(1)
    console.log('  ⚠️  Starting anyway. The app will show a "database not connected" message until you add it.\n')
  }
  return hasDb
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  ensureEnv({ requireDb: process.argv.includes('--require-db') })
}
