import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { route, readBody, HttpError } from '../_lib/http.js'
import { startSession, publicUser } from '../_lib/auth.js'

// Compared against when the email is unknown, so response time doesn't reveal which emails exist
const DUMMY_HASH = bcrypt.hashSync('pulsefit-timing-guard', 10)

export default route({
  async POST(req, res) {
    const body = readBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!email || !password) throw new HttpError(400, 'Please enter your email and password.')

    const sql = db()
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    const ok = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH)
    if (!user || !ok) throw new HttpError(401, 'That email and password combination is not right.', 'BAD_CREDENTIALS')

    await startSession(res, user.id)
    res.status(200).json({ user: publicUser(user) })
  },
})
