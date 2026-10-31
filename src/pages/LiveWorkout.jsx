import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Pause, Play, SkipForward, Plus, Check, Trophy, Clock, Layers, Dumbbell, Library as LibraryIcon, LayoutDashboard, Flag } from 'lucide-react'
import { Page, PageHeader, GlassCard, EmptyState, PageSkeleton, ConnectionError } from '../components/ui'
import { useApp } from '../context/AppContext'
import { api, localDate } from '../lib/api'

const SIZE = 260
const STROKE = 14
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R
const NO_TIMER = { total: 0, endsAt: 0, remaining: 0, running: false, label: '' }

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function fireConfetti() {
  const colors = ['#c6ff3d', '#22e4ff', '#ff5fa2', '#ffffff', '#ff9f43']
  const end = Date.now() + 1800
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.55 }, colors })
}

const allSetsDone = (w) => w.exercises.length > 0 && w.exercises.every((e) => e.sets.every((s) => s.completed))

function RestTimer({ total, remaining, running, onToggle, onSkip, onAdd, label, finished }) {
  const pct = total ? remaining / total : 0
  const resting = total > 0 && remaining > 0
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <div className={`absolute inset-6 rounded-full blur-2xl transition-opacity duration-700 ${resting || finished ? 'opacity-60' : 'opacity-20'}`} style={{ background: 'radial-gradient(#c6ff3d, #22e4ff)' }} />
        <svg width={SIZE} height={SIZE} className="relative -rotate-90">
          <defs>
            <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c6ff3d" />
              <stop offset="100%" stopColor="#22e4ff" />
            </linearGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--track)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={finished ? 0 : C * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.25s linear', filter: 'drop-shadow(0 0 10px rgba(198,255,61,.6))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          {finished ? (
            <div>
              <Trophy size={40} className="accent mx-auto" />
              <p className="mt-2 font-display text-3xl font-bold">Done!</p>
              <p className="muted mt-1 text-sm">See you tomorrow</p>
            </div>
          ) : (
            <div>
              <p className="muted text-xs font-semibold uppercase tracking-[0.25em]">{resting ? 'Rest' : 'Ready'}</p>
              <p className="font-display text-6xl font-bold tabular-nums">{resting ? fmt(remaining) : 'GO'}</p>
              <p className="muted mt-1 max-w-[160px] truncate text-sm">{resting ? label : 'Tick a set to start rest'}</p>
            </div>
          )}
        </div>
      </div>
      {!finished && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={onAdd} disabled={!resting} className="btn-ghost h-12 w-12 !p-0 disabled:opacity-40" aria-label="Add 15 seconds">
              <Plus size={18} />
            </button>
            <button onClick={onToggle} disabled={!resting} className="btn-primary h-16 w-16 !p-0" aria-label={running ? 'Pause timer' : 'Resume timer'}>
              {running ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button onClick={onSkip} disabled={!resting} className="btn-ghost h-12 w-12 !p-0 disabled:opacity-40" aria-label="Skip rest">
              <SkipForward size={18} />
            </button>
          </div>
          <p className="muted mt-2 text-xs">+15s · pause · skip</p>
        </>
      )}
    </div>
  )
}

export default function LiveWorkout() {
  const { toast } = useApp()
  const [workout, setWorkout] = useState(null)
  const [status, setStatus] = useState({ loading: true, error: null })
  const [timer, setTimer] = useState(NO_TIMER)
  const [elapsed, setElapsed] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const workoutRef = useRef(null)
  const saves = useRef(new Set())

  useEffect(() => {
    workoutRef.current = workout
  }, [workout])

  const load = useCallback(async () => {
    setStatus({ loading: true, error: null })
    try {
      const { workout } = await api('/workouts', { query: { date: localDate() } })
      setWorkout(workout)
      setStatus({ loading: false, error: null })
    } catch (error) {
      setStatus({ loading: false, error })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Workout clock, based on when the first set was ticked
  const inProgress = workout?.status === 'in_progress'
  const startedAt = workout?.startedAt
  useEffect(() => {
    if (!inProgress || !startedAt) return
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [inProgress, startedAt])

  // Rest countdown, driven by an end timestamp so it stays accurate
  useEffect(() => {
    if (!timer.running) return
    const id = setInterval(() => {
      const remaining = Math.max(0, (timer.endsAt - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimer((t) => ({ ...t, remaining: 0, running: false }))
        navigator.vibrate?.([200, 100, 200])
        toast({ type: 'info', title: 'Rest over. Next set!', message: "Let's go, you've got this." })
      } else {
        setTimer((t) => ({ ...t, remaining }))
      }
    }, 200)
    return () => clearInterval(id)
  }, [timer.running, timer.endsAt, toast])

  const finish = useCallback(async () => {
    setFinishing(true)
    setTimer(NO_TIMER)
    // Make sure every set tick has reached the server first
    await Promise.allSettled([...saves.current])
    const current = workoutRef.current
    if (!current || !allSetsDone(current)) {
      setFinishing(false)
      return
    }
    try {
      const { workout: saved } = await api('/workouts', { method: 'PATCH', body: { workoutId: current.id, action: 'complete' } })
      setWorkout(saved)
      setCelebrate(true)
      setTimeout(fireConfetti, 150)
    } catch (err) {
      toast({ type: 'error', title: "Couldn't save your finish", message: `${err.message} Your sets are safe. Tap "Finish workout" to try again.` })
    } finally {
      setFinishing(false)
    }
  }, [toast])

  function updateSet(setId, completed) {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)) })),
    }))
  }

  function toggleSet(ex, set, idx) {
    if (workout.status === 'completed' || finishing) return
    const completed = !set.completed

    // Optimistic update: the tick shows instantly, the save happens in the background
    updateSet(set.id, completed)
    if (completed && workout.status === 'planned') {
      setWorkout((w) => ({ ...w, status: 'in_progress', startedAt: new Date().toISOString() }))
    }

    const save = api('/sets', { method: 'PATCH', body: { setId: set.id, completed } })
      .then(({ workout: w }) => setWorkout((cur) => ({ ...cur, status: w.status, startedAt: w.startedAt })))
      .catch((err) => {
        updateSet(set.id, !completed)
        toast({ type: 'error', title: "That set didn't save", message: err.message })
        throw err
      })
    saves.current.add(save)
    save.catch(() => {}).finally(() => saves.current.delete(save))

    const next = {
      ...workout,
      exercises: workout.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => (s.id === set.id ? { ...s, completed } : s)) })),
    }
    if (allSetsDone(next)) {
      workoutRef.current = next
      finish()
    } else if (completed && ex.restSeconds > 0) {
      const label = idx + 1 < ex.sets.length ? `Up next: set ${idx + 2}` : 'Up next: new exercise'
      setTimer({ total: ex.restSeconds, remaining: ex.restSeconds, endsAt: Date.now() + ex.restSeconds * 1000, running: true, label })
    }
  }

  function toggleTimer() {
    setTimer((t) => (t.running ? { ...t, running: false } : { ...t, running: true, endsAt: Date.now() + t.remaining * 1000 }))
  }

  if (status.loading) return <PageSkeleton />
  if (status.error) return <ConnectionError error={status.error} onRetry={load} />
  if (!workout || workout.exercises.length === 0) {
    return (
      <Page>
        <PageHeader eyebrow="Live workout" title="Ready when you are" />
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today"
          message="Pick one from the Library! Add a few exercises and come back here to train."
          action={
            <Link to="/library" className="btn-primary">
              <LibraryIcon size={18} /> Open the Library
            </Link>
          }
        />
      </Page>
    )
  }

  const done = workout.status === 'completed'
  const totalSets = workout.exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets = workout.exercises.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)
  const progress = doneSets / totalSets
  const groups = [...new Set(workout.exercises.map((e) => e.muscleGroup))]
  const needsRetry = !done && !finishing && allSetsDone(workout)

  return (
    <Page>
      <PageHeader
        eyebrow="Live workout"
        title={workout.name}
        subtitle={groups.join(' · ')}
        action={
          <div className="glass flex items-center gap-2 !rounded-full px-4 py-2 font-display font-semibold tabular-nums">
            {done ? (
              <>
                <Check size={16} className="accent" /> {workout.durationMinutes} min
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  {inProgress && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${inProgress ? 'bg-rose-500' : 'bg-slate-400'}`} />
                </span>
                {inProgress ? fmt(elapsed) : '0:00'}
              </>
            )}
          </div>
        }
      />

      {/* overall progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="muted">{doneSets} of {totalSets} sets</span>
          <span className="accent font-semibold">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--track)' }}>
          <motion.div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-cyan-400 shadow-glow" animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 space-y-4 lg:order-1">
          {workout.exercises.map((ex, exIdx) => {
            const complete = ex.sets.every((s) => s.completed)
            return (
              <GlassCard key={ex.workoutExerciseId} delay={exIdx * 0.06} className={`p-5 transition-colors ${complete ? '!border-lime-400/40' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="muted text-xs font-semibold uppercase tracking-wider">Exercise {exIdx + 1} · {ex.muscleGroup}</p>
                    <h3 className="text-lg font-semibold">{ex.name}</h3>
                    <p className="muted text-sm">{ex.sets.length} × {ex.reps} · {ex.restSeconds}s rest</p>
                  </div>
                  <AnimatePresence>
                    {complete && (
                      <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-400 text-ink-950 shadow-glow">
                        <Check size={18} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ex.sets.map((set, i) => (
                    <motion.button
                      key={set.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSet(ex, set, i)}
                      disabled={done || finishing}
                      className={`flex min-w-[76px] items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        set.completed ? 'border-transparent bg-gradient-to-br from-lime-400 to-cyan-400 text-ink-950 shadow-glow' : 'hover:border-lime-400/50'
                      }`}
                      style={!set.completed ? { borderColor: 'var(--glass-border)', background: 'var(--glass)' } : undefined}
                      aria-pressed={set.completed}
                      aria-label={`${ex.name} set ${set.setNumber}`}
                    >
                      {set.completed ? <Check size={16} strokeWidth={3} /> : <span className="muted">Set</span>}
                      {set.setNumber}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            )
          })}
          {!done && (
            <Link to="/library" className="muted inline-flex items-center gap-2 text-sm hover:opacity-80">
              <Plus size={14} /> Add more exercises
            </Link>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <GlassCard className="p-6 lg:sticky lg:top-10">
            <RestTimer
              {...timer}
              finished={done}
              onToggle={toggleTimer}
              onSkip={() => setTimer((t) => ({ ...t, remaining: 0, running: false }))}
              onAdd={() => setTimer((t) => ({ ...t, total: t.total + 15, remaining: t.remaining + 15, endsAt: t.endsAt + 15000 }))}
            />
            {(needsRetry || finishing) && (
              <button onClick={finish} disabled={finishing} className="btn-primary mt-5 w-full">
                {finishing ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <><Flag size={18} /> Finish workout</>}
              </button>
            )}
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-md rounded-[32px] border p-8 text-center shadow-2xl"
              style={{ background: 'var(--glass-strong)', borderColor: 'rgba(198,255,61,.35)' }}
              role="dialog"
              aria-label="Workout complete"
            >
              <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-lime-400 to-cyan-400 text-ink-950 shadow-glow">
                <Trophy size={38} />
              </motion.div>
              <h2 className="mt-5 text-3xl font-bold">Workout crushed!</h2>
              <p className="muted mt-1">Saved to your history. Your streak just grew. Your future self says thanks.</p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  [Clock, `${workout.durationMinutes} min`, 'time'],
                  [Layers, totalSets, 'sets'],
                  [Dumbbell, workout.exercises.length, 'exercises'],
                ].map(([Icon, v, l]) => (
                  <div key={l} className="rounded-2xl border py-3" style={{ borderColor: 'var(--glass-border)' }}>
                    <Icon size={16} className="accent mx-auto" />
                    <p className="mt-1 font-display text-xl font-bold">{v}</p>
                    <p className="muted text-xs">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Link to="/dashboard" className="btn-primary flex-1">
                  <LayoutDashboard size={16} /> See dashboard
                </Link>
                <button onClick={() => setCelebrate(false)} className="btn-ghost flex-1">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}
