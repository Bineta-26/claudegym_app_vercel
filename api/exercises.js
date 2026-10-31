// Exercise library. Optional ?group=Chest filter.
import { db } from './_lib/db.js'
import { route, HttpError } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route({
  async GET(req, res) {
    await requireUserId(req)
    const group = req.query?.group
    if (group && group !== 'All' && !GROUPS.includes(group)) {
      throw new HttpError(400, `Unknown muscle group. Pick one of: ${GROUPS.join(', ')}.`)
    }
    const sql = db()
    const rows =
      group && group !== 'All'
        ? await sql`SELECT * FROM exercises WHERE muscle_group = ${group} ORDER BY name`
        : await sql`SELECT * FROM exercises ORDER BY array_position(ARRAY['Chest','Back','Legs','Arms','Core','Cardio'], muscle_group), name`

    res.status(200).json({
      exercises: rows.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscle_group,
        sets: e.sets,
        reps: e.reps,
        difficulty: e.difficulty,
        restSeconds: e.rest_seconds,
        description: e.description,
      })),
    })
  },
})
