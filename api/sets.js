// Tick or untick a set: PATCH { setId, completed }
// The first ticked set also starts the workout clock.
import { db } from './_lib/db.js'
import { route, readBody, HttpError } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

export default route({
  async PATCH(req, res) {
    const userId = await requireUserId(req)
    const body = readBody(req)
    const setId = Number(body.setId)
    if (!Number.isInteger(setId) || setId <= 0) throw new HttpError(400, 'A valid set is required.')
    if (typeof body.completed !== 'boolean') throw new HttpError(400, '"completed" must be true or false.')
    const completed = body.completed
    const sql = db()

    const [set] = await sql`
      UPDATE workout_sets s
      SET completed = ${completed},
          completed_at = CASE WHEN ${completed}::boolean THEN now() ELSE NULL END
      FROM workout_exercises we, workouts w
      WHERE s.id = ${setId}
        AND we.id = s.workout_exercise_id
        AND w.id = we.workout_id
        AND w.user_id = ${userId}
        AND w.status <> 'completed'
      RETURNING s.id, s.completed, w.id AS workout_id
    `
    if (!set) throw new HttpError(404, "We couldn't update that set. The workout may already be finished.")

    if (completed) {
      await sql`
        UPDATE workouts SET status = 'in_progress', started_at = now()
        WHERE id = ${set.workout_id} AND status = 'planned'
      `
    }
    const [workout] = await sql`SELECT id, status, started_at FROM workouts WHERE id = ${set.workout_id}`

    res.status(200).json({
      set: { id: set.id, completed: set.completed },
      workout: { id: workout.id, status: workout.status, startedAt: workout.started_at },
    })
  },
})
