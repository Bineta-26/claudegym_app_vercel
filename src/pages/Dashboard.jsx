import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Play, Flame, Clock, Zap, CalendarDays, ArrowRight, Dumbbell, CheckCircle2, Library as LibraryIcon } from 'lucide-react'
import { Page, GlassCard, ProgressRing, AnimatedCounter, QuoteCard, PageSkeleton, ConnectionError } from '../components/ui'
import { useApp } from '../context/AppContext'
import { api, localDate } from '../lib/api'
import { classSchedule, classTypes } from '../data/mock'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-3 py-2 text-sm shadow-xl" style={{ background: 'var(--glass-strong)', borderColor: 'var(--glass-border)' }}>
      <p className="font-semibold">{label}</p>
      <p className="muted">{payload[0].value ? `${payload[0].value} active min` : 'Rest day'}</p>
    </div>
  )
}

function TodayCard({ workout }) {
  if (!workout || workout.exercises.length === 0) {
    return (
      <GlassCard className="relative flex flex-col justify-center overflow-hidden p-6 lg:col-span-2" delay={0.05}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
        <Dumbbell className="absolute -bottom-6 right-4 h-40 w-40 -rotate-12 opacity-[0.05]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider accent">
            <Zap size={12} /> Today's workout
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">No workout yet today.</h2>
          <p className="muted mt-1 max-w-md">Pick one from the Library! Add a few exercises and they'll show up right here, ready to start.</p>
          <Link to="/library" className="btn-primary mt-6">
            <LibraryIcon size={18} /> Browse the Library
          </Link>
        </div>
      </GlassCard>
    )
  }

  const groups = [...new Set(workout.exercises.map((e) => e.muscleGroup))]
  const done = workout.status === 'completed'
  return (
    <GlassCard className="relative overflow-hidden p-6 lg:col-span-2" delay={0.05}>
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
      <Dumbbell className="absolute -bottom-6 right-4 h-40 w-40 -rotate-12 opacity-[0.05]" />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider accent">
          {done ? <CheckCircle2 size={12} /> : <Zap size={12} />} {done ? 'Completed today' : "Today's workout"}
        </span>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">{workout.name}</h2>
        <p className="muted mt-1">{groups.join(' · ')}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Clock size={16} className="accent" /> {done ? `${workout.durationMinutes} min` : `~${workout.estimatedMinutes} min`}
          </span>
          <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-400" /> ~{workout.estimatedCalories} kcal</span>
          <span className="flex items-center gap-1.5">
            <Dumbbell size={16} className="text-cyan-400" /> {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'} · {workout.totalSets} sets
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {workout.exercises.map((e) => (
            <span key={e.workoutExerciseId} className="chip !py-1.5 text-xs">{e.name}</span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/workout" className={done ? 'btn-ghost' : 'btn-primary'}>
            {done ? <CheckCircle2 size={18} className="accent" /> : <Play size={18} fill="currentColor" />}
            {done ? 'View workout' : workout.status === 'in_progress' ? 'Resume' : 'Start'}
          </Link>
          {!done && (
            <span className="muted text-sm">
              {workout.completedSets} / {workout.totalSets} sets done
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const { theme, bookings } = useApp()
  const [state, setState] = useState({ data: null, error: null, loading: true })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api('/dashboard', { query: { date: localDate() } })
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error, loading: false })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (state.loading && !state.data) return <PageSkeleton />
  if (state.error) return <ConnectionError error={state.error} onRetry={load} />

  const { user, today, weeklyActivity, streak, week } = state.data
  const muted = theme === 'dark' ? '#8b95a5' : '#5b6573'
  const todayIdx = weeklyActivity.length - 1
  const totalMin = weeklyActivity.reduce((s, d) => s + d.minutes, 0)
  const nextClass = classSchedule.find((c) => bookings.includes(c.id))
  const rings = [
    { label: 'Workouts', value: week.workouts, goal: week.goalWorkouts, color: '#c6ff3d' },
    { label: 'Active min', value: week.minutes, goal: week.goalMinutes, color: '#22e4ff' },
    { label: 'Goals hit', value: week.goalsHit, goal: week.goals.length, color: '#ff5fa2' },
  ]

  return (
    <Page>
      <div className="mb-6 md:mb-8">
        <p className="muted">{greeting()},</p>
        <h1 className="text-3xl font-bold md:text-4xl">
          {user.fullName.split(' ')[0]}. <span className="text-gradient">Let's move.</span>
        </h1>
      </div>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        <TodayCard workout={today} />

        {/* Streak */}
        <GlassCard className="relative flex flex-col justify-between overflow-hidden p-6" delay={0.1}>
          <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <p className="muted text-sm font-medium">Current streak</p>
            <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-xs font-semibold text-orange-400">Best: {streak.best}</span>
          </div>
          <div className="relative my-4 flex items-end gap-3">
            <motion.div animate={streak.current ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}} transition={{ duration: 1.8, repeat: Infinity }}>
              <Flame
                size={56}
                className={streak.current ? 'text-orange-400 drop-shadow-[0_0_16px_rgba(251,146,60,0.7)]' : 'muted opacity-40'}
                fill="currentColor"
              />
            </motion.div>
            <p className="font-display text-6xl font-bold leading-none">
              <AnimatedCounter value={streak.current} />
            </p>
            <p className="muted pb-1.5">day{streak.current === 1 ? '' : 's'}</p>
          </div>
          {streak.current === 0 && <p className="muted relative -mt-2 mb-3 text-sm">Finish a workout today to light the flame.</p>}
          <div className="relative flex justify-between gap-1">
            {weeklyActivity.map((d, i) => (
              <div key={d.date} className="flex flex-col items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06, type: 'spring' }}
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs ${d.minutes ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white' : 'border border-dashed'} ${i === todayIdx ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-transparent' : ''}`}
                  style={!d.minutes ? { borderColor: 'var(--glass-border)' } : undefined}
                  title={`${d.day}: ${d.minutes} min`}
                >
                  {d.minutes ? <Flame size={14} fill="currentColor" /> : ''}
                </motion.span>
                <span className="muted text-[10px] font-medium">{d.day[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Progress rings */}
        <GlassCard className="p-6 lg:col-span-3" delay={0.15}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">This week</h3>
            <span className="muted text-sm">Resets Monday</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {rings.map((r, i) => (
              <div key={r.label} className="flex flex-col items-center">
                <div className="hidden sm:block">
                  <ProgressRing value={r.value} goal={r.goal} color={r.color} size={140} stroke={12} delay={0.3 + i * 0.15}>
                    <div>
                      <p className="font-display text-3xl font-bold"><AnimatedCounter value={r.value} /></p>
                      <p className="muted text-xs">of {r.goal}</p>
                    </div>
                  </ProgressRing>
                </div>
                <div className="sm:hidden">
                  <ProgressRing value={r.value} goal={r.goal} color={r.color} size={96} stroke={9} delay={0.3 + i * 0.15}>
                    <div>
                      <p className="font-display text-xl font-bold"><AnimatedCounter value={r.value} /></p>
                      <p className="muted text-[10px]">of {r.goal}</p>
                    </div>
                  </ProgressRing>
                </div>
                <p className="mt-3 text-center text-sm font-medium">{r.label}</p>
                <p className="light-dim text-xs font-semibold" style={{ color: r.color }}>{Math.min(100, Math.round((r.value / r.goal) * 100))}%</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {week.goals.map((g) => (
              <span key={g.label} className={`chip flex items-center gap-1.5 !py-1 text-xs ${g.done ? '!border-lime-400/50' : 'opacity-70'}`}>
                <CheckCircle2 size={13} className={g.done ? 'accent' : 'muted'} /> {g.label}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Weekly chart */}
        <GlassCard className="p-6 lg:col-span-2" delay={0.2}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-semibold">Weekly activity</h3>
              <p className="muted text-sm">Active minutes, last 7 days</p>
            </div>
            <p className="font-display text-2xl font-bold">
              <AnimatedCounter value={totalMin} /> <span className="muted text-sm font-normal">min</span>
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c6ff3d" />
                    <stop offset="100%" stopColor="#22e4ff" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 12 }} allowDecimals={false} domain={[0, (max) => Math.max(30, max)]} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(198,255,61,0.08)', radius: 12 }} />
                <Bar dataKey="minutes" radius={[10, 10, 10, 10]} animationDuration={1400} animationEasing="ease-out" maxBarSize={42} minPointSize={3}>
                  {weeklyActivity.map((d, i) => (
                    <Cell key={d.date} fill={i === todayIdx ? '#ff5fa2' : 'url(#barGrad)'} fillOpacity={d.minutes ? 1 : 0.25} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right column */}
        <div className="flex flex-col gap-4 md:gap-5">
          <QuoteCard delay={0.25} />
          <GlassCard className="p-5" delay={0.3}>
            <p className="muted mb-3 text-sm font-medium">Next class</p>
            {nextClass ? (
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: `${classTypes[nextClass.type].color}22`, color: classTypes[nextClass.type].color }}>
                  <CalendarDays size={22} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nextClass.title}</p>
                  <p className="muted text-sm">{nextClass.day} · {nextClass.time} · {nextClass.coach}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold">No classes booked yet</p>
                <p className="muted text-sm">Spin, HIIT, Yoga and Boxing are filling up fast.</p>
              </div>
            )}
            <Link to="/classes" className="accent mt-2 inline-flex items-center gap-1 py-2.5 text-sm font-semibold">
              {nextClass ? 'View schedule' : 'Book a class'} <ArrowRight size={14} />
            </Link>
          </GlassCard>
        </div>
      </div>
    </Page>
  )
}
