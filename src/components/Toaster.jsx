import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const icons = {
  success: { Icon: CheckCircle2, color: '#c6ff3d' },
  error: { Icon: AlertTriangle, color: '#ff6b6b' },
  info: { Icon: Info, color: '#22e4ff' },
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 md:items-end md:px-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const { Icon, color } = icons[t.type] || icons.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl"
              style={{ background: 'var(--glass-strong)', borderColor: `${color}55`, boxShadow: `0 20px 50px -20px ${color}66` }}
              role="status"
            >
              <Icon size={20} style={{ color }} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold">{t.title}</p>
                {t.message && <p className="muted mt-0.5 text-sm">{t.message}</p>}
              </div>
              <button onClick={() => dismissToast(t.id)} className="muted shrink-0 rounded-full p-1 hover:opacity-70" aria-label="Dismiss">
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
