// Everything the dashboard needs for the logged-in user, in one request.
import { db } from './_lib/db.js'
import { route, clientDate } from './_lib/http.js'
import { requireUserId, publicUser } from './_lib/auth.js'
import { loadWorkout } from './_lib/workouts.js'

const DAY_MS = 86400000
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const toDate = (s) => new Date(s + 'T00:00:00Z')
const toStr = (d) => d.toISOString().slice(0, 10)
const addDays = (s, n) => toStr(new Date(toDate(s).getTime() + n * DAY_MS))

function streaks(dates, today) {
  const set = new Set(dates)
  // A streak is still alive if you trained yesterday but not yet today
  let cursor = set.has(today) ? today : addDays(today, -1)
  let current = 0
  while (set.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }
  let best = 0
  let run = 0
  let prev = null
  for (const d of [...set].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return { current, best }
}

export default route({
  async GET(req, res) {
    const userId = await requireUserId(req)
    const today = clientDate(req)
    const sql = db()

    const [[user], days, todayWorkout] = await Promise.all([
      sql`SELECT * FROM users WHERE id = ${userId}`,
      sql`
        SELECT workout_date::text AS d, SUM(COALESCE(duration_minutes, 0))::int AS minutes, COUNT(*)::int AS workouts
        FROM workouts
        WHERE user_id = ${userId} AND status = 'completed'
          AND workout_date > ${today}::date - 400 AND workout_date <= ${today}::date
        GROUP BY workout_date
      `,
      loadWorkout(userId, today),
    ])

    const byDate = new Map(days.map((r) => [r.d, r]))

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6)
      return { date, day: DAY_NAMES[toDate(date).getUTCDay()], minutes: byDate.get(date)?.minutes || 0 }
    })

    // Calendar week starts on Monday
    const weekStart = addDays(today, -((toDate(today).getUTCDay() + 6) % 7))
    let weekWorkouts = 0
    let weekMinutes = 0
    for (const r of days) {
      if (r.d >= weekStart && r.d <= today) {
        weekWorkouts += r.workouts
        weekMinutes += r.minutes
      }
    }

    const streak = streaks(days.map((r) => r.d), today)
    const goals = [
      { label: `${user.weekly_goal_workouts} workouts this week`, done: weekWorkouts >= user.weekly_goal_workouts },
      { label: `${user.weekly_goal_minutes} active minutes this week`, done: weekMinutes >= user.weekly_goal_minutes },
      { label: '3-day streak', done: streak.current >= 3 },
    ]

    res.status(200).json({
      user: publicUser(user),
      today: todayWorkout,
      weeklyActivity,
      streak,
      week: {
        workouts: weekWorkouts,
        minutes: weekMinutes,
        goalWorkouts: user.weekly_goal_workouts,
        goalMinutes: user.weekly_goal_minutes,
        goals,
        goalsHit: goals.filter((g) => g.done).length,
      },
    })
  },
})
