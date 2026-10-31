import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Dumbbell, Clock, Flame } from 'lucide-react'
import Logo from '../components/Logo'
import { ThemeToggle, getQuoteOfTheDay } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

function AuthShell({ title, subtitle, children, footer }) {
  const quote = getQuoteOfTheDay()
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-4 md:px-8 lg:grid-cols-2 lg:pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="hidden lg:block">
          <h2 className="text-6xl font-bold leading-[0.95]">
            Train smarter.
            <br />
            <span className="text-gradient">Get stronger.</span>
          </h2>
          <p className="muted mt-6 max-w-md text-lg">Plan your sessions, tick off every set, and watch your streak grow.</p>
          <div className="mt-10 flex gap-3">
            {[
              [Dumbbell, '30', 'exercises'],
              [Clock, 'Live', 'rest timer'],
              [Flame, 'Daily', 'streaks'],
            ].map(([Icon, v, l]) => (
              <div key={l} className="glass flex-1 p-4">
                <Icon size={18} className="accent" />
                <p className="mt-2 font-display text-xl font-bold">{v}</p>
                <p className="muted text-sm">{l}</p>
              </div>
            ))}
          </div>
          <p className="muted mt-10 max-w-md italic">"{quote.text}"</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative mx-auto w-full max-w-md overflow-hidden !rounded-[32px] p-6 sm:p-8"
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="muted mt-1">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <p className="muted mt-6 text-center text-sm">{footer}</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function Field({ icon: Icon, label, type = 'text', value, onChange, autoComplete, placeholder, right }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:border-lime-400/70 focus-within:shadow-[0_0_0_4px_rgba(198,255,61,0.12)]" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass)' }}>
        <Icon size={18} className="muted shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className="w-full min-w-0 bg-transparent outline-none placeholder:text-[color:var(--muted)]"
        />
        {right}
      </span>
    </label>
  )
}

function PasswordField({ value, onChange, autoComplete, hint }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <Field
        icon={Lock}
        label="Password"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder="••••••••"
        right={
          <button type="button" onClick={() => setShow((s) => !s)} className="muted shrink-0 hover:opacity-80" aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />
      {hint && <p className="muted mt-1.5 text-xs">{hint}</p>}
    </div>
  )
}

function FormError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-2 overflow-hidden rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500 dark:text-rose-300"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function SubmitButton({ busy, children }) {
  return (
    <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
      {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <>{children} <ArrowRight size={18} /></>}
    </button>
  )
}

function useRedirectTarget() {
  const location = useLocation()
  return location.state?.from || '/dashboard'
}

export function Login() {
  const { user, login } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && !busy) return <Navigate to={target} replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await login(email, password)
      toast({ title: `Welcome back, ${u.fullName.split(' ')[0]}! 💪`, message: "Let's pick up where you left off." })
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to keep your streak alive."
      footer={
        <>
          New to PulseFit?{' '}
          <Link to="/signup" state={{ from: target }} className="accent font-semibold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@example.com" />
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        <FormError message={error} />
        <SubmitButton busy={busy}>Log in</SubmitButton>
      </form>
    </AuthShell>
  )
}

const WORKOUT_GOALS = [2, 3, 4, 5, 6]

export function Signup() {
  const { user, signup } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 150 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  if (user && !busy) return <Navigate to={target} replace />

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 8) return setError('Your password needs at least 8 characters.')
    setBusy(true)
    setError('')
    try {
      const u = await signup(form)
      toast({ title: `Welcome to PulseFit, ${u.fullName.split(' ')[0]}! 🎉`, message: 'Add a few exercises from the Library to build your first workout.' })
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Join PulseFit"
      subtitle="Set your goals and start training in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from: target }} className="accent font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field icon={User} label="Your name" value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder="Alex Rivera" />
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
        <PasswordField value={form.password} onChange={set('password')} autoComplete="new-password" hint="At least 8 characters." />

        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--glass-border)' }}>
          <p className="text-sm font-medium">Workouts per week</p>
          <div className="mt-2.5 grid grid-cols-5 gap-2">
            {WORKOUT_GOALS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('weeklyGoalWorkouts')(n)}
                className={`chip !px-0 text-center font-display text-base font-bold ${form.weeklyGoalWorkouts === n ? 'chip-active' : ''}`}
                aria-pressed={form.weeklyGoalWorkouts === n}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm font-medium">Active minutes per week</p>
            <p className="accent font-display text-lg font-bold">{form.weeklyGoalMinutes} min</p>
          </div>
          <input
            type="range"
            min={30}
            max={600}
            step={10}
            value={form.weeklyGoalMinutes}
            onChange={(e) => set('weeklyGoalMinutes')(Number(e.target.value))}
            className="mt-2 w-full accent-lime-400"
            aria-label="Active minutes per week"
          />
          <p className="muted mt-1 text-xs">Health experts suggest at least 150 minutes a week.</p>
        </div>

        <FormError message={error} />
        <SubmitButton busy={busy}>Create my account</SubmitButton>
      </form>
    </AuthShell>
  )
}
