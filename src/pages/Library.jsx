import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, Layers, Repeat, Timer, Check, Play, PartyPopper } from 'lucide-react'
import { Page, PageHeader, EmptyState, DifficultyBadge, Skeleton, ConnectionError } from '../components/ui'
import { useApp } from '../context/AppContext'
import { api, localDate } from '../lib/api'

const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

const groupColors = {
  Chest: '#c6ff3d',
  Back: '#22e4ff',
  Legs: '#ff5fa2',
  Arms: '#ff9f43',
  Core: '#a78bfa',
  Cardio: '#f87171',
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading exercises">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="glass space-y-4 p-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-11 w-full !rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function Library() {
  const { toast } = useApp()
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [exercises, setExercises] = useState(null)
  const [workout, setWorkout] = useState(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(new Set())

  const load = useCallback(async () => {
    setError(null)
    try {
      const [ex, w] = await Promise.all([api('/exercises'), api('/workouts', { query: { date: localDate() } })])
      setExercises(ex.exercises)
      setWorkout(w.workout)
    } catch (err) {
      setError(err)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const inWorkout = useMemo(() => new Set(workout?.exercises.map((e) => e.exerciseId) || []), [workout])
  const workoutDone = workout?.status === 'completed'

  const filtered = useMemo(() => {
    if (!exercises) return []
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) => (group === 'All' || e.muscleGroup === group) && (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [exercises, group, query])

  async function toggle(ex) {
    if (pending.has(ex.id)) return
    const added = inWorkout.has(ex.id)
    setPending((p) => new Set(p).add(ex.id))
    try {
      if (added) {
        const { workout } = await api('/workouts', { method: 'DELETE', query: { exerciseId: ex.id, date: localDate() } })
        setWorkout(workout)
        toast({ type: 'info', title: 'Removed from today', message: `${ex.name} is out of today's workout.` })
      } else {
        const { workout } = await api('/workouts', { method: 'POST', body: { exerciseId: ex.id, date: localDate() } })
        setWorkout(workout)
        toast({ title: "Added to today's workout 💪", message: `${ex.name}: ${ex.sets} × ${ex.reps}` })
      }
    } catch (err) {
      toast({ type: 'error', title: added ? "Couldn't remove that one" : "Couldn't add that one", message: err.message })
    } finally {
      setPending((p) => {
        const next = new Set(p)
        next.delete(ex.id)
        return next
      })
    }
  }

  const count = workout?.exercises.length || 0

  return (
    <Page>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={exercises ? `${exercises.length} coach-approved exercises. Filter by muscle group and build today's session.` : 'Coach-approved exercises. Filter by muscle group and build today\'s session.'}
        action={
          count > 0 && (
            <Link to="/workout" className={workoutDone ? 'btn-ghost' : 'btn-primary'}>
              {workoutDone ? <PartyPopper size={18} className="accent" /> : <Play size={18} fill="currentColor" />}
              {workoutDone ? 'Done for today' : `Start workout (${count})`}
            </Link>
          )
        }
      />

      <div className="sticky top-[68px] z-30 -mx-4 mb-6 space-y-3 px-4 py-2 backdrop-blur-xl lg:top-0 lg:mx-0 lg:rounded-3xl lg:px-0">
        <label className="glass flex items-center gap-3 !rounded-2xl px-4 py-3">
          <Search size={18} className="muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-transparent outline-none placeholder:text-[color:var(--muted)]"
          />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {muscleGroups.map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`chip ${group === g ? 'chip-active' : ''}`}>
              {g}
              {g !== 'All' && exercises && <span className="ml-1.5 opacity-60">{exercises.filter((e) => e.muscleGroup === g).length}</span>}
            </button>
          ))}
        </div>
      </div>

      {workoutDone && (
        <div className="glass mb-5 flex items-center gap-3 !rounded-2xl px-4 py-3 text-sm">
          <PartyPopper size={18} className="accent shrink-0" />
          <span>You've finished today's workout. Amazing! Come back tomorrow to plan the next one.</span>
        </div>
      )}

      {error ? (
        <ConnectionError error={error} onRetry={load} />
      ) : !exercises ? (
        <LibrarySkeleton />
      ) : exercises.length === 0 ? (
        <EmptyState title="The library is empty" message='No exercises in the database yet. Run "npm run db:setup" to add the starter set.' />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No exercises match that"
          message={`Nothing found for "${query}"${group !== 'All' ? ` in ${group}` : ''}. Try another word or clear the filters.`}
          action={
            <button className="btn-ghost" onClick={() => { setQuery(''); setGroup('All') }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((ex, i) => {
              const color = groupColors[ex.muscleGroup]
              const isAdded = inWorkout.has(ex.id)
              const busy = pending.has(ex.id)
              return (
                <motion.article
                  layout
                  key={ex.id}
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                  className={`glass lift group relative flex flex-col overflow-hidden p-5 ${isAdded ? '!border-lime-400/40' : ''}`}
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: color }} />
                  <div className="relative min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="light-dim text-xs font-semibold uppercase tracking-wider" style={{ color }}>{ex.muscleGroup}</span>
                      <DifficultyBadge level={ex.difficulty} />
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold leading-tight">{ex.name}</h3>
                    <p className="muted mt-1 line-clamp-2 text-sm">{ex.description}</p>
                  </div>
                  <div className="relative mt-4 grid grid-cols-3 gap-2">
                    {[
                      [Layers, ex.sets, 'sets'],
                      [Repeat, ex.reps, 'reps'],
                      [Timer, `${ex.restSeconds}s`, 'rest'],
                    ].map(([Icon, v, l]) => (
                      <div key={l} className="rounded-2xl border px-3 py-2.5" style={{ borderColor: 'var(--glass-border)' }}>
                        <Icon size={14} className="muted" />
                        <p className="mt-1 truncate font-display text-lg font-bold leading-none">{v}</p>
                        <p className="muted text-[11px] uppercase tracking-wider">{l}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => toggle(ex)}
                    disabled={busy || workoutDone}
                    className={`relative mt-4 w-full !py-2.5 text-sm ${isAdded ? 'btn-ghost !border-lime-400/50' : 'btn-primary'} disabled:opacity-60`}
                    aria-pressed={isAdded}
                  >
                    {busy ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : isAdded ? (
                      <><Check size={16} className="accent" /> In today's workout</>
                    ) : (
                      <><Plus size={16} /> Add to today's workout</>
                    )}
                  </button>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </Page>
  )
}
