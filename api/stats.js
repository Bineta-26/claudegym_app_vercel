// Public community numbers for the landing page.
import { db } from './_lib/db.js'
import { route } from './_lib/http.js'

export default route({
  async GET(req, res) {
    const [row] = await db()`
      SELECT
        (SELECT COUNT(*) FROM users)::int                                    AS members,
        (SELECT COUNT(*) FROM workouts WHERE status = 'completed')::int      AS workouts_completed,
        (SELECT COUNT(*) FROM classes
          WHERE start_time >= date_trunc('week', now())
            AND start_time <  date_trunc('week', now()) + interval '7 days')::int AS classes_this_week
    `
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      members: row.members,
      workoutsCompleted: row.workouts_completed,
      classesThisWeek: row.classes_this_week,
    })
  },
})
