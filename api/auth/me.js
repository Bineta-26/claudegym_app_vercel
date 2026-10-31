import { db } from '../_lib/db.js'
import { route } from '../_lib/http.js'
import { sessionUserId, endSession, publicUser } from '../_lib/auth.js'

// "Who am I?" Logged-out visitors get { user: null } (not a 401), so public pages stay error-free.
export default route({
  async GET(req, res) {
    const userId = await sessionUserId(req)
    if (!userId) return res.status(200).json({ user: null })
    const [user] = await db()`SELECT * FROM users WHERE id = ${userId}`
    if (!user) {
      // Token was valid but the account no longer exists
      endSession(res)
      return res.status(200).json({ user: null })
    }
    res.status(200).json({ user: publicUser(user) })
  },
})
