import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, Flame, Timer, Trophy, CalendarDays, TrendingUp, Play, Heart, LogOut } from 'lucide-react'
import Logo from '../components/Logo'
import { AnimatedCounter, ProgressRing, ThemeToggle, QuoteCard, Skeleton } from '../components/ui'
import { Avatar, useLogout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { user } from '../data/mock'

function useCommunityStats() {
  const [state, setState] = useState({ stats: null, error: null })
  useEffect(() => {
    let alive = true
    api('/stats')
      .then((stats) => alive && setState({ stats, error: null }))
      .catch((error) => alive && setState({ stats: null, error }))
    return () => {
      alive = false
    }
  }, [])
  return state
}

const features = [
  { icon: Dumbbell, title: 'Smart workout library', text: '120+ exercises, filtered by muscle group and difficulty.', to: '/library', color: '#c6ff3d', img: '/images/library.webp' },
  { icon: Timer, title: 'Live workout mode', text: 'Rest timers, set tracking and a little party when you finish.', to: '/workout', color: '#22e4ff', img: '/images/live-workout.webp' },
  { icon: TrendingUp, title: 'Progress you can see', text: 'Strength curves and PR trophies that keep you coming back.', to: '/progress', color: '#ff5fa2', img: '/images/progress.webp' },
  { icon: CalendarDays, title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing with live spot counts.', to: '/classes', color: '#ff9f43', img: '/images/classes.webp' },
  { icon: Flame, title: 'Streaks that stick', text: 'Daily streaks and weekly rings to build the habit.', to: '/dashboard', color: '#fb923c', img: '/images/streaks.webp' },
  { icon: Trophy, title: 'Earn your badges', text: 'Unlock achievements as you hit new milestones.', to: '/profile', color: '#a78bfa', img: '/images/badges.webp' },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const rise = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-lime-400/40 to-cyan-400/40 blur-3xl" />
      <div className="relative mb-[-5.5rem] overflow-hidden rounded-[36px] border" style={{ borderColor: 'var(--glass-border)' }}>
        <img src="/images/hero.webp" alt="Athlete doing a kettlebell swing in a neon-lit gym" className="aspect-[16/10] w-full object-cover object-[70%_center]" fetchpriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>
      <div className="glass relative mx-4 !rounded-[36px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="muted text-xs uppercase tracking-widest">Today</p>
            <p className="font-display text-xl font-bold">Push Day: Power</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-lime-400/15">
            <Dumbbell size={18} className="accent" />
          </span>
        </div>
        <div className="my-6 grid place-items-center">
          <ProgressRing value={78} goal={100} size={190} stroke={14} delay={0.8}>
            <div>
              <p className="font-display text-5xl font-bold">
                <AnimatedCounter value={78} />%
              </p>
              <p className="muted text-sm">weekly goal</p>
            </div>
          </ProgressRing>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['48', 'min'],
            ['420', 'kcal'],
            ['13', 'sets'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border py-3" style={{ borderColor: 'var(--glass-border)' }}>
              <p className="font-display text-lg font-bold">{v}</p>
              <p className="muted text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="glass absolute -left-4 top-24 flex items-center gap-2 !rounded-2xl px-4 py-3 sm:-left-12"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame className="text-orange-400" size={22} />
        <div>
          <p className="font-display font-bold leading-none">{user.streak} days</p>
          <p className="muted text-xs">streak</p>
        </div>
      </motion.div>

      <motion.div
        className="glass absolute -right-3 bottom-24 flex items-center gap-2 !rounded-2xl px-4 py-3 sm:-right-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart className="text-rose-400" size={22} fill="currentColor" />
        <div>
          <p className="font-display font-bold leading-none">142 bpm</p>
          <p className="muted text-xs">in the zone</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Landing() {
  const { user: me } = useAuth()
  const handleLogout = useLogout()
  const { stats, error: statsError } = useCommunityStats()
  const startTo = me ? '/dashboard' : '/signup'
  const communityStats = [
    { label: 'Members', value: stats?.members },
    { label: 'Workouts completed', value: stats?.workoutsCompleted },
    { label: 'Classes this week', value: stats?.classesThisWeek },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#features" className="muted py-2.5 transition hover:text-[color:var(--text)]">Features</a>
          <Link to="/classes" className="muted py-2.5 transition hover:text-[color:var(--text)]">Classes</Link>
          <Link to="/progress" className="muted py-2.5 transition hover:text-[color:var(--text)]">Progress</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {me ? (
            <>
              <Link to="/dashboard" className="btn-ghost !py-1.5 !pl-1.5 !pr-4 text-sm" title="Open your dashboard">
                <Avatar name={me.fullName} size="h-7 w-7 text-xs" />
                <span className="hidden max-w-[10rem] truncate sm:inline">{me.fullName}</span>
                <span className="sm:hidden">App</span>
              </Link>
              <button onClick={handleLogout} className="glass grid h-10 w-10 place-items-center !rounded-full hover:text-rose-400" aria-label="Log out" title="Log out">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">Sign up</Link>
            </>
          )}
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-8 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={rise} className="glass mb-6 inline-flex items-center gap-2 !rounded-full px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
            </span>
            <span className="muted">
              {stats ? `${stats.members.toLocaleString()} ${stats.members === 1 ? 'member is' : 'members are'} training with PulseFit` : 'Your whole gym, in your pocket'}
            </span>
          </motion.div>
          <motion.h1 variants={rise} className="text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl xl:text-8xl">
            Train smarter.
            <br />
            <span className="text-gradient">Get stronger.</span>
          </motion.h1>
          <motion.p variants={rise} className="muted mt-6 max-w-lg text-lg">
            PulseFit plans your workouts, tracks every rep, books your favourite classes and keeps your streak alive.
            Your whole gym in your pocket.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
            <Link to={startTo} className="btn-primary px-8 py-4 text-lg">
              <Play size={20} fill="currentColor" /> Start Your Workout
            </Link>
            <Link to={me ? '/dashboard' : '/login'} className="btn-ghost px-6 py-4">
              {me ? 'See your dashboard' : 'I already have an account'} <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        <HeroVisual />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="glass grid gap-6 p-6 sm:grid-cols-3 md:p-10">
          {communityStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center sm:border-r sm:last:border-r-0"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="text-gradient flex h-12 items-center justify-center font-display text-4xl font-bold md:h-[60px] md:text-5xl">
                {stats ? <AnimatedCounter value={s.value} /> : statsError ? '–' : <Skeleton className="h-10 w-28" />}
              </div>
              <p className="muted mt-1 text-sm font-medium uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="accent mb-2 text-xs font-semibold uppercase tracking-[0.2em]">Everything you need</p>
          <h2 className="text-4xl font-bold md:text-5xl">Built for the way you actually train.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}>
              <Link to={f.to} className="glass lift group block h-full overflow-hidden p-6">
                <div className="-mx-6 -mt-6 mb-5 overflow-hidden">
                  <img src={f.img} alt={f.title} loading="lazy" className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: `${f.color}22`, color: f.color, boxShadow: `0 0 30px -10px ${f.color}` }}>
                  <f.icon size={22} />
                </span>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="muted mt-1.5">{f.text}</p>
                <span className="accent mt-4 inline-flex items-center gap-1 text-sm font-semibold opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        <QuoteCard className="mt-6" />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-lime-400 via-emerald-300 to-cyan-400 p-10 text-ink-950 md:p-16">
          <img src="/images/cta-banner.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-y-0 right-0 hidden h-full w-3/5 object-cover md:block" style={{ maskImage: 'linear-gradient(to right, transparent, black 45%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 45%)' }} />
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <h2 className="relative max-w-xl text-4xl font-bold md:text-5xl">Your next PR starts today.</h2>
          <p className="relative mt-3 max-w-md text-ink-900/80">Jump into today's workout. It takes less than 50 minutes and your future self will thank you.</p>
          <Link to={startTo} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-ink-950 px-8 py-4 font-display font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-2xl">
            <Play size={18} fill="currentColor" /> Start Your Workout
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t px-4 py-10 md:px-8" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <p className="muted text-sm">© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
        </div>
      </footer>
    </div>
  )
}
