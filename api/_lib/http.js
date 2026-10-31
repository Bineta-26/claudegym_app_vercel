// Shared request/response helpers for /api functions (works on Vercel and the local Express server).
import { DbUnavailableError } from './db.js'

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function readBody(req) {
  const body = req.body
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      throw new HttpError(400, 'That request was not valid JSON.')
    }
  }
  return body
}

export function parseCookies(req) {
  const out = {}
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** The caller's local calendar date (sent by the browser), falling back to the server's UTC date. */
export function clientDate(req) {
  const d = String(req.query?.date || readBody(req).date || '')
  if (DATE_RE.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'))) return d
  return new Date().toISOString().slice(0, 10)
}

function isConnectionError(err) {
  const text = `${err?.name} ${err?.message} ${err?.cause?.code} ${err?.cause?.message}`
  return /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|getaddrinfo|password authentication failed|Couldn't connect|connection/i.test(text)
}

/**
 * Wraps an API handler: checks the HTTP method and turns errors into friendly JSON.
 * handlers = { GET: fn, POST: fn, ... }
 */
export function route(handlers) {
  return async function handler(req, res) {
    const fn = handlers[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, code: err.code })
      }
      if (err instanceof DbUnavailableError || isConnectionError(err)) {
        console.error('[api] database unreachable:', err.message)
        return res.status(503).json({
          code: 'DB_UNAVAILABLE',
          error: "We can't reach the database right now. Please check your connection and try again in a moment.",
        })
      }
      if (err?.code === '42P01') {
        console.error('[api] missing table:', err.message)
        return res.status(503).json({
          code: 'DB_NOT_SETUP',
          error: 'The database is connected but not set up yet. Run "npm run db:setup" and refresh.',
        })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  }
}
