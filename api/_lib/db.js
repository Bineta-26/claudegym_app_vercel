// Server-only database access. DATABASE_URL never leaves the backend.
import { neon } from '@neondatabase/serverless'

export class DbUnavailableError extends Error {}

let sql

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new DbUnavailableError('DATABASE_URL is not set')
  }
  sql ??= neon(process.env.DATABASE_URL)
  return sql
}
