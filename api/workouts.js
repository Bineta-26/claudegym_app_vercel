// Today's workout for the logged-in user.
//   GET    ?date=YYYY-MM-DD                 -> { workout | null }
//   POST   { exerciseId, date }             -> add an exercise to that day's workout
//   DELETE ?exerciseId=..&date=..           -> remove an exercise from that day's workout
//   PATCH  { workoutId, action: 'complete' } -> finish the workout and save its duration
import { db } from './_lib/db.js'
import { route, readBody, clientDate, HttpError } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { loadWorkout, renameWorkout } from './_lib/workouts.js'

function positiveInt(value, label) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `A valid ${label} is required.`)
  return n
}

export default route({
  async GET(req, res) {
    const userId = await requireUserId(req)
    res.status(200).json({ workout: await loadWorkout(userId, clientDate(req)) })
  },

  async POST(req, res) {
    const userId = await requireUserId(req)
    const body = readBody(req)
    const exerciseId = positiveInt(body.exerciseId, 'exercise')
    const date = clientDate(req)
    const sql = db()

    const [exercise] = await sql`SELECT id, name, sets FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, "We couldn't find that exercise. Try refreshing the library.")

    const [workout] = await sql`
      INSERT INTO workouts (user_id, workout_date) VALUES (${userId}, ${date})
      ON CONFLICT (user_id, workout_date) DO UPDATE SET workout_date = EXCLUDED.workout_date
      RETURNING id, status
    `
    if (workout.status === 'completed') {
      throw new HttpError(409, "You've already finished today's workout. Amazing! Plan your next one tomorrow.", 'WORKOUT_COMPLETED')
    }

    // Add the exercise and its sets in one atomic statement; does nothing if it's already in the workout
    const inserted = await sql`
      WITH we AS (
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        VALUES (
          ${workout.id}, ${exercise.id},
          (SELECT COALESCE(MAX(order_index) + 1, 0) FROM workout_exercises WHERE workout_id = ${workout.id})
        )
        ON CONFLICT (workout_id, exercise_id) DO NOTHING
        RETURNING id
      )
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT we.id, gs FROM we, generate_series(1, ${exercise.sets}::int) AS gs
      RETURNING workout_exercise_id
    `
    if (inserted.length) await renameWorkout(workout.id)

    res.status(inserted.length ? 201 : 200).json({
      alreadyAdded: inserted.length === 0,
      workout: await loadWorkout(userId, date),
    })
  },

  async DELETE(req, res) {
    const userId = await requireUserId(req)
    const exerciseId = positiveInt(req.query?.exerciseId, 'exercise')
    const date = clientDate(req)
    const sql = db()

    const [removed] = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.workout_id = w.id
        AND w.user_id = ${userId}
        AND w.workout_date = ${date}
        AND w.status <> 'completed'
        AND we.exercise_id = ${exerciseId}
      RETURNING w.id AS workout_id
    `
    if (!removed) throw new HttpError(404, "That exercise isn't in today's workout.")

    // Drop the workout entirely if it's now empty and hasn't been started
    const [gone] = await sql`
      DELETE FROM workouts w
      WHERE w.id = ${removed.workout_id} AND w.status = 'planned'
        AND NOT EXISTS (SELECT 1 FROM workout_exercises we WHERE we.workout_id = w.id)
      RETURNING id
    `
    if (!gone) await renameWorkout(removed.workout_id)

    res.status(200).json({ workout: await loadWorkout(userId, date) })
  },

  async PATCH(req, res) {
    const userId = await requireUserId(req)
    const body = readBody(req)
    const workoutId = positiveInt(body.workoutId, 'workout')
    if (body.action !== 'complete') throw new HttpError(400, 'Unknown action.')
    const sql = db()

    const [done] = await sql`
      UPDATE workouts
      SET status = 'completed',
          completed_at = now(),
          started_at = COALESCE(started_at, now()),
          duration_minutes = GREATEST(1, CEIL(EXTRACT(EPOCH FROM (now() - COALESCE(started_at, now()))) / 60))::int
      WHERE id = ${workoutId} AND user_id = ${userId} AND status <> 'completed'
      RETURNING workout_date::text AS workout_date
    `
    if (!done) {
      // Already completed (e.g. a double tap) is fine; anything else is not this user's workout
      const [existing] = await sql`
        SELECT workout_date::text AS workout_date FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}
      `
      if (!existing) throw new HttpError(404, "We couldn't find that workout.")
      return res.status(200).json({ workout: await loadWorkout(userId, existing.workout_date) })
    }
    res.status(200).json({ workout: await loadWorkout(userId, done.workout_date) })
  },
})
