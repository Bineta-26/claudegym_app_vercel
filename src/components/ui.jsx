import { motion, useInView, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Quote, SearchX, DatabaseZap, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { quotes } from '../data/mock'

/* Page wrapper: fades and slides each screen in. */
export function Page({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow && <p className="accent mb-1 text-xs font-semibold uppercase tracking-[0.2em]">{eyebrow}</p>}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="muted mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function GlassCard({ children, className = '', delay = 0, hover = false, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass ${hover ? 'lift' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* Counts up from 0 once scrolled into view. */
export function AnimatedCounter({ value, duration = 1.8, suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

/* SVG ring that fills to value/goal. */
export function ProgressRing({ value, goal, size = 120, stroke = 10, color = '#c6ff3d', children, delay = 0 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / goal, 1)

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useApp()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      className={`glass relative grid h-10 w-10 place-items-center !rounded-full transition hover:scale-105 ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.span>
    </button>
  )
}

export function getQuoteOfTheDay() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start) / 86400000)
  return quotes[dayOfYear % quotes.length]
}

export function QuoteCard({ className = '', delay = 0 }) {
  const q = getQuoteOfTheDay()
  return (
    <GlassCard delay={delay} className={`relative overflow-hidden p-5 md:p-6 ${className}`}>
      <Quote className="absolute -right-2 -top-2 h-24 w-24 rotate-12 opacity-[0.06]" />
      <p className="accent mb-2 text-xs font-semibold uppercase tracking-[0.2em]">Quote of the day</p>
      <p className="font-display text-lg font-medium leading-snug md:text-xl">"{q.text}"</p>
      <p className="muted mt-2 text-sm">{q.author}</p>
    </GlassCard>
  )
}

export function EmptyState({ icon: Icon = SearchX, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-lime-400/20 to-cyan-400/20">
        <Icon className="accent" size={28} />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="muted mt-1.5 max-w-sm">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

/* Glass-style loading placeholder with a moving sheen. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        <Skeleton className="h-64 !rounded-3xl lg:col-span-2" />
        <Skeleton className="h-64 !rounded-3xl" />
        <Skeleton className="h-56 !rounded-3xl lg:col-span-3" />
      </div>
    </div>
  )
}

/* Shown when the server or database can't be reached. */
export function ConnectionError({ error, onRetry, compact = false }) {
  const title =
    error?.code === 'DB_NOT_SETUP'
      ? 'Almost there: the database needs setting up'
      : error?.isOffline
        ? "We can't reach the database right now"
        : 'That didn\'t load'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass mx-auto flex max-w-lg flex-col items-center text-center ${compact ? 'px-6 py-8' : 'mt-10 px-6 py-14'}`}
      role="alert"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15">
        <DatabaseZap className="text-rose-400" size={28} />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="muted mt-1.5 max-w-sm">{error?.message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button className="btn-ghost mt-5" onClick={onRetry}>
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </motion.div>
  )
}

export const difficultyStyles = {
  Beginner: 'bg-emerald-400/15 text-emerald-500 dark:text-emerald-300 ring-emerald-400/30',
  Intermediate: 'bg-amber-400/15 text-amber-600 dark:text-amber-300 ring-amber-400/30',
  Advanced: 'bg-rose-400/15 text-rose-600 dark:text-rose-300 ring-rose-400/30',
}

export function DifficultyBadge({ level }) {
  const bars = { Beginner: 1, Intermediate: 2, Advanced: 3 }[level]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${difficultyStyles[level]}`}>
      <span className="flex items-end gap-0.5">
        {[1, 2, 3].map((b) => (
          <span key={b} className={`w-1 rounded-sm bg-current ${b <= bars ? 'opacity-100' : 'opacity-25'}`} style={{ height: 4 + b * 2 }} />
        ))}
      </span>
      {level}
    </span>
  )
}
