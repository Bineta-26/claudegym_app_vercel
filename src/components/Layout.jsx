import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Dumbbell, Timer, TrendingUp, CalendarDays, UserRound, LogOut, LogIn } from 'lucide-react'
import Logo from './Logo'
import { ThemeToggle, getQuoteOfTheDay } from './ui'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library', label: 'Workouts', icon: Dumbbell },
  { to: '/workout', label: 'Live Workout', short: 'Live', icon: Timer },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/classes', label: 'Classes', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function Avatar({ name, size = 'h-9 w-9 text-sm' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-lime-400 to-cyan-400 font-display font-bold text-ink-950 ${size}`}>
      {initialsOf(name)}
    </span>
  )
}

export function useLogout() {
  const { logout } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  return async () => {
    try {
      await logout()
      toast({ type: 'info', title: 'Logged out', message: 'See you at your next session!' })
    } catch {
      toast({ type: 'error', title: "Couldn't reach the server", message: 'You have been logged out on this device.' })
    }
    navigate('/')
  }
}

function Sidebar() {
  const quote = getQuoteOfTheDay()
  const { user } = useAuth()
  const handleLogout = useLogout()
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r p-5 lg:flex" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass)', backdropFilter: 'blur(20px)' }}>
      <div className="px-2 pb-8 pt-1">
        <Logo to="/" />
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="relative">
            {({ isActive }) => (
              <span className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${isActive ? 'text-ink-950' : 'muted hover:text-[color:var(--text)]'}`}>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-400 to-cyan-400 shadow-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={19} className="relative" />
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
          <p className="muted italic leading-snug">"{quote.text}"</p>
        </div>
        {user ? (
          <div className="space-y-3 rounded-2xl p-2">
            <Link to="/profile" className="flex min-w-0 items-center gap-3">
              <Avatar name={user.fullName} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{user.fullName}</span>
                <span className="muted block truncate text-xs">{user.email}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={handleLogout} className="btn-ghost h-10 flex-1 !py-0 text-sm hover:!border-rose-400/50 hover:text-rose-400" aria-label="Log out">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2">
            <Link to="/login" className="btn-primary flex-1 !py-2.5 text-sm">
              <LogIn size={16} /> Log in
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const { user } = useAuth()
  const handleLogout = useLogout()
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 pb-3 lg:hidden"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)', background: 'linear-gradient(var(--bg) 60%, transparent)' }}
    >
      <Logo to="/" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <button onClick={handleLogout} className="glass grid h-10 w-10 place-items-center !rounded-full hover:text-rose-400" aria-label="Log out">
              <LogOut size={17} />
            </button>
            <Link to="/profile" aria-label={`Profile: ${user.fullName}`}>
              <Avatar name={user.fullName} size="h-10 w-10 text-sm" />
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}

function BottomNav() {
  const items = navItems.filter((i) => i.to !== '/profile')
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden">
      <div className="glass mx-auto flex max-w-md items-center justify-around !rounded-[28px] px-2 py-2">
        {items.map(({ to, label, short, icon: Icon }) => {
          const center = to === '/workout'
          return (
            <NavLink key={to} to={to} className="flex-1">
              {({ isActive }) =>
                center ? (
                  <span className="-mt-8 flex flex-col items-center">
                    <span className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-lime-400 to-cyan-400 text-ink-950 shadow-glow ring-4 transition-transform ${isActive ? 'scale-110' : ''}`} style={{ '--tw-ring-color': 'var(--bg)' }}>
                      <Icon size={24} />
                    </span>
                    <span className={`mt-1 text-[11px] font-semibold ${isActive ? 'accent' : 'muted'}`}>{short}</span>
                  </span>
                ) : (
                  <span className={`relative flex flex-col items-center gap-1 py-1.5 text-[11px] font-medium transition-colors ${isActive ? 'accent' : 'muted'}`}>
                    {isActive && <motion.span layoutId="bottom-dot" className="absolute -top-1 h-1 w-6 rounded-full bg-lime-400 shadow-glow" />}
                    <Icon size={21} />
                    {label}
                  </span>
                )
              }
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileTopBar />
      <main className="px-4 pb-32 pt-2 md:px-8 lg:ml-64 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
