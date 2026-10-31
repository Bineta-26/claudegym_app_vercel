import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pulsefit-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [toasts, setToasts] = useState([])
  const [bookings, setBookings] = useState(() => readStorage('pulsefit-bookings', []))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('pulsefit-theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => writeStorage('pulsefit-bookings', bookings), [bookings])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const dismissToast = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    ({ title, message, type = 'success', duration = 3500 }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((all) => [...all.slice(-2), { id, title, message, type }])
      setTimeout(() => dismissToast(id), duration)
    },
    [dismissToast],
  )

  const toggleBooking = useCallback((classId) => {
    setBookings((all) => (all.includes(classId) ? all.filter((id) => id !== classId) : [...all, classId]))
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, toasts, toast, dismissToast, bookings, toggleBooking }),
    [theme, toggleTheme, toasts, toast, dismissToast, bookings, toggleBooking],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
