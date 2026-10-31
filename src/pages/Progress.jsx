import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Trophy, TrendingUp, Calendar } from 'lucide-react'
import { Page, PageHeader, GlassCard, AnimatedCounter } from '../components/ui'
import { useApp } from '../context/AppContext'
import { strengthHistory, personalRecords } from '../data/mock'

const lifts = [
  { key: 'deadlift', label: 'Deadlift', color: '#c6ff3d' },
  { key: 'squat', label: 'Squat', color: '#22e4ff' },
  { key: 'bench', label: 'Bench', color: '#ff5fa2' },
]

const tiers = {
  gold: { from: '#fde047', to: '#f59e0b', label: 'Gold' },
  silver: { from: '#e5e7eb', to: '#94a3b8', label: 'Silver' },
  bronze: { from: '#fdba74', to: '#c2410c', label: 'Bronze' },
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-3 py-2 text-sm shadow-xl" style={{ background: 'var(--glass-strong)', borderColor: 'var(--glass-border)' }}>
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="muted capitalize">{p.dataKey}</span>
          <span className="ml-auto pl-3 font-semibold">{p.value} kg</span>
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const { theme } = useApp()
  const [active, setActive] = useState(lifts.map((l) => l.key))
  const muted = theme === 'dark' ? '#8b95a5' : '#5b6573'
  const grid = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(10,20,30,0.07)'

  const first = strengthHistory[0]
  const last = strengthHistory[strengthHistory.length - 1]
  const totalGain = lifts.reduce((s, l) => s + (last[l.key] - first[l.key]), 0)

  function toggle(key) {
    setActive((a) => (a.includes(key) ? (a.length > 1 ? a.filter((k) => k !== key) : a) : [...a, key]))
  }

  return (
    <Page>
      <PageHeader eyebrow="Progress" title="Look how far you've come" subtitle="Your strength over the last 7 months, plus every personal record you've smashed." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total kg gained', value: totalGain, suffix: ' kg', color: '#c6ff3d' },
          { label: 'Deadlift', value: last.deadlift, suffix: ' kg', color: '#c6ff3d' },
          { label: 'Squat', value: last.squat, suffix: ' kg', color: '#22e4ff' },
          { label: 'Bench', value: last.bench, suffix: ' kg', color: '#ff5fa2' },
        ].map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.06} className="p-4 md:p-5">
            <p className="muted text-xs font-medium uppercase tracking-wider">{s.label}</p>
            <p className="light-dim mt-1 font-display text-2xl font-bold md:text-3xl" style={{ color: i === 0 ? undefined : s.color }}>
              <AnimatedCounter value={s.value} suffix={s.suffix} />
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5 md:p-6" delay={0.2}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp size={18} className="accent" /> Strength gains</h3>
            <p className="muted text-sm">Estimated 1-rep max (kg)</p>
          </div>
          <div className="flex gap-2">
            {lifts.map((l) => {
              const on = active.includes(l.key)
              return (
                <button
                  key={l.key}
                  onClick={() => toggle(l.key)}
                  className="chip flex items-center gap-2"
                  style={on ? { borderColor: l.color, boxShadow: `0 0 20px -8px ${l.color}` } : { opacity: 0.55 }}
                  aria-pressed={on}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={strengthHistory} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 12 }} domain={[40, 160]} ticks={[40, 70, 100, 130, 160]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: grid, strokeWidth: 2 }} />
              {lifts
                .filter((l) => active.includes(l.key))
                .map((l) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={l.color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
                    activeDot={{ r: 7, stroke: theme === 'dark' ? '#05070b' : '#fff', strokeWidth: 3 }}
                    animationDuration={1600}
                    style={{ filter: `drop-shadow(0 4px 10px ${l.color}66)` }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personal records</h2>
        <span className="muted text-sm">{personalRecords.length} PRs</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personalRecords.map((pr, i) => {
          const t = tiers[pr.tier]
          return (
            <motion.div
              key={pr.lift}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="glass lift relative flex items-center gap-4 overflow-hidden p-5"
            >
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: t.to }} />
              <motion.div
                whileHover={{ rotate: [0, -12, 12, 0], scale: 1.08 }}
                className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-ink-950"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})`, boxShadow: `0 8px 24px -8px ${t.to}` }}
              >
                <Trophy size={26} />
              </motion.div>
              <div className="relative min-w-0 flex-1">
                <p className="muted text-sm">{pr.lift}</p>
                <p className="font-display text-2xl font-bold leading-tight">{pr.value}</p>
                <p className="muted mt-0.5 flex items-center gap-1 text-xs"><Calendar size={11} /> {pr.date}</p>
              </div>
              <div className="relative text-right">
                <span className="rounded-full bg-lime-400/15 px-2 py-1 text-xs font-semibold accent">{pr.delta}</span>
                <p className="muted mt-2 text-[10px] font-semibold uppercase tracking-wider">{t.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Page>
  )
}
