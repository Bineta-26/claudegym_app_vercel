// JWT session helpers. The token lives in an httpOnly cookie, so page scripts can never read it.
import { SignJWT, jwtVerify } from 'jose'
import { HttpError, parseCookies } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

function cookie(value, maxAge) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export async function startSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE))
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0))
}

/** Returns the logged-in user's id, or null. */
export async function sessionUserId(req) {
  const token = parseCookies(req)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

/** Returns the logged-in user's id or throws a 401. */
export async function requireUserId(req) {
  const id = await sessionUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  return id
}

export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    weeklyGoalWorkouts: row.weekly_goal_workouts,
    weeklyGoalMinutes: row.weekly_goal_minutes,
    createdAt: row.created_at,
  }
}
