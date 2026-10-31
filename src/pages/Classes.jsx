import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, User, CalendarX, Check, Users } from 'lucide-react'
import { Page, PageHeader, EmptyState } from '../components/ui'
import { useApp } from '../context/AppContext'
import { classSchedule, classTypes, weekDays } from '../data/mock'

export default function Classes() {
  const { bookings, toggleBooking, toast } = useApp()
  const todayIdx = (new Date().getDay() + 6) % 7
  const [day, setDay] = useState(weekDays[todayIdx])
  const [type, setType] = useState('All')
  const [pending, setPending] = useState(null)
  const stripRef = useRef(null)

  // Keep the selected day visible in the horizontally scrolling strip on phones
  useEffect(() => {
    const strip = stripRef.current
    const el = strip?.querySelector('[data-active="true"]')
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [day])

  const dates = useMemo(() => {
    const monday = new Date()
    monday.setDate(monday.getDate() - todayIdx)
    return weekDays.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.getDate()
    })
  }, [todayIdx])

  const visible = classSchedule.filter((c) => c.day === day && (type === 'All' || c.type === type))

  function book(c) {
    const isBooked = bookings.includes(c.id)
    if (!isBooked && c.spots === 0) {
      toast({ type: 'error', title: 'This class is full', message: "We'll let you know if a spot opens up. Try another time slot!" })
      return
    }
    setPending(c.id)
    // Simulate a quick network round-trip
    setTimeout(() => {
      toggleBooking(c.id)
      setPending(null)
      if (isBooked) {
        toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.title} has been released.` })
      } else {
        toast({ title: "You're in! 🎉", message: `${c.title} · ${c.day} at ${c.time} with ${c.coach}` })
      }
    }, 550)
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Class booking"
        title="Sweat with the squad"
        subtitle="Book group classes led by our top coaches. Spots go fast."
        action={
          bookings.length > 0 && (
            <span className="glass inline-flex items-center gap-2 !rounded-full px-4 py-2 text-sm font-semibold">
              <Check size={16} className="accent" /> {bookings.length} booked this week
            </span>
          )
        }
      />

      {/* Week strip */}
      <div ref={stripRef} className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        {weekDays.map((d, i) => {
          const active = d === day
          const count = classSchedule.filter((c) => c.day === d).length
          const hasBooking = classSchedule.some((c) => c.day === d && bookings.includes(c.id))
          return (
            <button
              key={d}
              data-active={active}
              onClick={() => setDay(d)}
              className={`relative flex min-w-[64px] flex-1 flex-col items-center rounded-2xl border px-3 py-3 transition-all ${active ? 'border-transparent text-ink-950' : 'hover:border-lime-400/40'}`}
              style={!active ? { borderColor: 'var(--glass-border)', background: 'var(--glass)' } : undefined}
            >
              {active && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lime-400 to-cyan-400 shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative text-xs font-semibold uppercase ${active ? '' : 'muted'}`}>{d}</span>
              <span className="relative font-display text-2xl font-bold">{dates[i]}</span>
              <span className={`relative text-[10px] ${active ? 'opacity-70' : 'muted'}`}>{count} classes</span>
              {hasBooking && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />}
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {['All', ...Object.keys(classTypes)].map((t) => (
          <button key={t} onClick={() => setType(t)} className={`chip flex items-center gap-2 ${type === t ? 'chip-active' : ''}`}>
            {t !== 'All' && <span className="h-2 w-2 rounded-full" style={{ background: classTypes[t].color }} />}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {visible.length === 0 ? (
          <EmptyState
            key="empty"
            icon={CalendarX}
            title={`No ${type === 'All' ? '' : type + ' '}classes on ${day}`}
            message="Our coaches are resting up. Pick another day or check out a different class type."
            action={<button className="btn-ghost" onClick={() => setType('All')}>Show all classes</button>}
          />
        ) : (
          <motion.div key={day + type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2">
            {visible.map((c, i) => {
              const color = classTypes[c.type].color
              const booked = bookings.includes(c.id)
              const spots = booked ? Math.max(c.spots - 1, 0) : c.spots
              const full = c.spots === 0 && !booked
              const filledPct = ((c.capacity - spots) / c.capacity) * 100
              const low = spots > 0 && spots <= 3
              return (
                <motion.article
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`glass lift relative overflow-hidden p-5 ${booked ? '!border-lime-400/50' : ''}`}
                >
                  <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: color, boxShadow: `0 0 20px ${color}` }} />
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="min-w-0">
                      <span className="light-dim inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider" style={{ background: `${color}22`, color }}>
                        {c.type}
                      </span>
                      <h3 className="mt-2 text-xl font-semibold">{c.title}</h3>
                      <div className="muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center gap-1"><Clock size={14} /> {c.time} · {c.duration} min</span>
                        <span className="flex items-center gap-1"><User size={14} /> {c.coach}</span>
                      </div>
                    </div>
                    <p className="font-display text-3xl font-bold leading-none">{c.time.split(':')[0]}<span className="muted text-base">:{c.time.split(':')[1]}</span></p>
                  </div>

                  <div className="mt-5 pl-2">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className={`flex items-center gap-1 font-semibold ${full ? 'text-rose-400' : low ? 'text-orange-400' : 'muted'}`}>
                        <Users size={12} /> {full ? 'Class full' : `${spots} spot${spots === 1 ? '' : 's'} left`}
                      </span>
                      <span className="muted">{c.capacity - spots}/{c.capacity}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--track)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: full ? '#fb7185' : color }} initial={{ width: 0 }} animate={{ width: `${filledPct}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.07 }} />
                    </div>
                    <button
                      onClick={() => book(c)}
                      disabled={pending === c.id}
                      className={`mt-4 w-full ${booked ? 'btn-ghost !border-lime-400/50' : full ? 'btn-ghost opacity-70' : 'btn-primary'}`}
                    >
                      {pending === c.id ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : booked ? (
                        <><Check size={18} className="accent" /> Booked · tap to cancel</>
                      ) : full ? (
                        'Join waitlist'
                      ) : (
                        'Book class'
                      )}
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}
