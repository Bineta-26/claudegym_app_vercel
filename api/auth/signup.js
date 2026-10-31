import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { route, readBody, HttpError } from '../_lib/http.js'
import { startSession, publicUser } from '../_lib/auth.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function intInRange(value, min, max, label) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${label} should be a whole number between ${min} and ${max}.`)
  }
  return n
}

export default route({
  async POST(req, res) {
    const body = readBody(req)
    const fullName = String(body.fullName || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (fullName.length < 2) throw new HttpError(400, 'Please tell us your name.')
    if (fullName.length > 80) throw new HttpError(400, 'That name is a bit long. Keep it under 80 characters.')
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'That email address does not look right.')
    if (password.length < 8) throw new HttpError(400, 'Your password needs at least 8 characters.')
    if (password.length > 72) throw new HttpError(400, 'Your password can be at most 72 characters.')
    const goalWorkouts = intInRange(body.weeklyGoalWorkouts ?? 4, 1, 14, 'Weekly workouts')
    const goalMinutes = intInRange(body.weeklyGoalMinutes ?? 150, 10, 2000, 'Weekly active minutes')

    const hash = await bcrypt.hash(password, 10)
    const sql = db()
    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `
    if (!user) throw new HttpError(409, 'An account with this email already exists. Try logging in instead.', 'EMAIL_TAKEN')

    await startSession(res, user.id)
    res.status(201).json({ user: publicUser(user) })
  },
})
