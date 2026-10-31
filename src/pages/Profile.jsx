import { motion } from 'framer-motion'
import { Dumbbell, Flame, Trophy, Timer, CalendarCheck, Zap, Medal, Footprints, Lock, Crown, Moon, Sun, Bell, ChevronRight } from 'lucide-react'
import { Page, GlassCard, AnimatedCounter } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { user, achievements, profileStats } from '../data/mock'

const iconMap = { Dumbbell, Flame, Trophy, Timer, CalendarCheck, Zap, Medal, Footprints }
const badgeColors = ['#c6ff3d', '#fb923c', '#fde047', '#22e4ff', '#a78bfa', '#ff5fa2', '#f87171', '#34d399']

export default function Profile() {
  const { theme, toggleTheme, toast } = useApp()
  const { user: me } = useAuth()
  const name = me?.fullName || user.name
  const handle = me?.email || user.handle
  const since = me ? new Date(me.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : user.memberSince
  const unlocked = achievements.filter((a) => a.unlocked).length
  const xpPct = (user.xp / user.xpNext) * 100

  return (
    <Page>
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-lime-400/30 to-cyan-400/30 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="relative">
            <motion.div
              className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,#c6ff3d,#22e4ff,#ff5fa2,#c6ff3d)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative grid h-28 w-28 place-items-center rounded-full font-display text-4xl font-bold" style={{ background: 'var(--bg)' }}>
              <span className="text-gradient">{initialsOf(name)}</span>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950 px-2.5 py-0.5 text-xs font-bold text-lime-400 ring-2 ring-lime-400/50">
              LVL {user.level}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
            <p className="muted">{handle} · Member since {since}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-1.5 text-sm font-bold text-ink-950 shadow-[0_8px_24px_-8px_rgba(251,146,60,.8)]">
              <Crown size={16} /> {user.membership}
            </div>
            <div className="mx-auto mt-5 max-w-md md:mx-0">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="muted">Level {user.level} → {user.level + 1}</span>
                <span className="font-semibold">{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--track)' }}>
                <motion.div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-cyan-400 shadow-glow" initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {profileStats.map((s) => (
            <div key={s.label} className="rounded-2xl border p-4 text-center" style={{ borderColor: 'var(--glass-border)' }}>
              <p className="font-display text-3xl font-bold"><AnimatedCounter value={s.value} /></p>
              <p className="muted text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="mb-4 mt-10 flex items-end justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <span className="muted text-sm">{unlocked} of {achievements.length} unlocked</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {achievements.map((a, i) => {
          const Icon = iconMap[a.icon] || Trophy
          const color = badgeColors[i % badgeColors.length]
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ y: -4 }}
              onClick={() =>
                toast(
                  a.unlocked
                    ? { title: `🏅 ${a.title}`, message: a.desc }
                    : { type: 'info', title: `Locked: ${a.title}`, message: `Keep going! ${a.desc} to unlock.` },
                )
              }
              className={`glass flex flex-col items-center p-5 text-center transition ${a.unlocked ? '' : 'opacity-60'}`}
            >
              <div
                className="relative grid h-16 w-16 place-items-center rounded-2xl"
                style={
                  a.unlocked
                    ? { background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 10px 30px -10px ${color}`, color: '#05070b' }
                    : { background: 'var(--track)' }
                }
              >
                <Icon size={28} className={a.unlocked ? '' : 'muted'} />
                {!a.unlocked && (
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink-800 text-white ring-2" style={{ '--tw-ring-color': 'var(--bg)' }}>
                    <Lock size={12} />
                  </span>
                )}
              </div>
              <p className="mt-3 font-display font-semibold">{a.title}</p>
              <p className="muted mt-0.5 text-xs">{a.desc}</p>
            </motion.button>
          )
        })}
      </div>

      <h2 className="mb-4 mt-10 text-2xl font-bold">Settings</h2>
      <GlassCard className="divide-y divide-[color:var(--glass-border)] overflow-hidden">
        <button onClick={toggleTheme} className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-lime-400/5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400/15">{theme === 'dark' ? <Moon size={18} className="accent" /> : <Sun size={18} className="accent" />}</span>
          <span className="flex-1">
            <span className="block font-semibold">Appearance</span>
            <span className="muted text-sm">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </span>
          <span className={`relative h-7 w-12 rounded-full transition-colors ${theme === 'dark' ? 'bg-lime-400' : 'bg-slate-300'}`}>
            <motion.span layout className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
          </span>
        </button>
        <button
          onClick={() => toast({ type: 'info', title: 'Reminders are on', message: "We'll nudge you at 6:30pm on training days." })}
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-lime-400/5"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15"><Bell size={18} className="text-cyan-400" /></span>
          <span className="flex-1">
            <span className="block font-semibold">Workout reminders</span>
            <span className="muted text-sm">Weekdays at 6:30pm</span>
          </span>
          <ChevronRight size={18} className="muted" />
        </button>
      </GlassCard>
    </Page>
  )
}
