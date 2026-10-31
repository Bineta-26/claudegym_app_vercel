// Loads one user's workout for a given date, with its exercises and sets.
import { db } from './db.js'

export async function loadWorkout(userId, date) {
  const sql = db()
  const [workout] = await sql`
    SELECT id, name, workout_date::text AS workout_date, status, duration_minutes, started_at, completed_at
    FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${date}
  `
  if (!workout) return null

  const rows = await sql`
    SELECT we.id AS workout_exercise_id, we.order_index,
           e.id AS exercise_id, e.name, e.muscle_group, e.reps, e.rest_seconds, e.difficulty,
           s.id AS set_id, s.set_number, s.completed
    FROM workout_exercises we
    JOIN exercises e     ON e.id = we.exercise_id
    JOIN workout_sets s  ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${workout.id}
    ORDER BY we.order_index, we.id, s.set_number
  `

  const byId = new Map()
  for (const r of rows) {
    if (!byId.has(r.workout_exercise_id)) {
      byId.set(r.workout_exercise_id, {
        workoutExerciseId: r.workout_exercise_id,
        exerciseId: r.exercise_id,
        name: r.name,
        muscleGroup: r.muscle_group,
        reps: r.reps,
        restSeconds: r.rest_seconds,
        difficulty: r.difficulty,
        sets: [],
      })
    }
    byId.get(r.workout_exercise_id).sets.push({ id: r.set_id, setNumber: r.set_number, completed: r.completed })
  }
  const exercises = [...byId.values()]
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  // Rough estimate: ~40s of work per set plus the prescribed rest
  const estimatedMinutes = Math.max(
    5,
    Math.round(exercises.reduce((m, e) => m + e.sets.length * (40 + e.restSeconds), 0) / 60),
  )

  return {
    id: workout.id,
    name: workout.name,
    date: workout.workout_date,
    status: workout.status,
    durationMinutes: workout.duration_minutes,
    startedAt: workout.started_at,
    completedAt: workout.completed_at,
    exercises,
    totalSets,
    completedSets: exercises.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0),
    estimatedMinutes,
    estimatedCalories: Math.round(estimatedMinutes * 8.5),
  }
}

/** Names the workout after its muscle groups, e.g. "Chest & Arms Day" or "Full Body Day". */
export async function renameWorkout(workoutId) {
  const sql = db()
  const groups = await sql`
    SELECT e.muscle_group, MIN(we.order_index) AS first
    FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ${workoutId}
    GROUP BY e.muscle_group ORDER BY first
  `
  const names = groups.map((g) => g.muscle_group)
  const name = names.length === 0 ? "Today's Workout" : names.length > 2 ? 'Full Body Day' : `${names.join(' & ')} Day`
  await sql`UPDATE workouts SET name = ${name} WHERE id = ${workoutId}`
}
