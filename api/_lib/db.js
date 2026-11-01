// Server-only database access. DATABASE_URL never leaves the backend.
import { neon } from '@neondatabase/serverless'

export class DbUnavailableError extends Error {}

let sql

// Accept the plain name or the prefixed names Vercel's Neon integration creates
// (e.g. "claude_gyp_app_DATABASE_URL"). Empty values are ignored.
export function databaseUrl() {
  const direct = process.env.DATABASE_URL?.trim()
  if (direct) return direct
  for (const [key, value] of Object.entries(process.env)) {
    if (/(^|_)DATABASE_URL$/.test(key) && value?.trim()) return value.trim()
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (/(^|_)POSTGRES_URL$/.test(key) && value?.trim()) return value.trim()
  }
  return ''
}

export function db() {
  const url = databaseUrl()
  if (!url) {
    throw new DbUnavailableError('DATABASE_URL is not set')
  }
  sql ??= neon(url)
  return sql
}

// Creates the tables and sample data the first time the API finds them missing.
// Both SQL files are idempotent, so running this more than once is harmless.
let setupPromise
export function ensureSchema() {
  setupPromise ??= (async () => {
    const { SCHEMA_SQL, SEED_SQL } = await import('./setup-sql.js')
    const statements = `${SCHEMA_SQL}\n${SEED_SQL}`
      .split(/;\s*(?:\r?\n|$)/)
      .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
      .filter(Boolean)
    const q = db()
    for (const statement of statements) await q.query(statement)
    console.log(`[api] database set up automatically (${statements.length} statements)`)
  })().catch((err) => {
    setupPromise = undefined
    throw err
  })
  return setupPromise
}

// The sample classes are scheduled relative to the current week, so add the new
// week's timetable when it is missing. Safe to repeat (ON CONFLICT DO NOTHING).
let classesWeek
export async function ensureWeeklyClasses() {
  const now = new Date()
  const week = `${now.getUTCFullYear()}-${Math.floor((now - Date.UTC(now.getUTCFullYear(), 0, 1)) / 604800000)}`
  if (classesWeek === week) return
  const { SEED_SQL } = await import('./setup-sql.js')
  const statement = SEED_SQL.slice(SEED_SQL.indexOf('INSERT INTO classes')).replace(/;\s*$/, '')
  await db().query(statement)
  classesWeek = week
}
