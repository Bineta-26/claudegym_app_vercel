import { useId } from 'react'
import { Link } from 'react-router-dom'

export function PulseMark({ className = 'h-9 w-9' }) {
  // Unique per instance: a hidden duplicate (e.g. the desktop sidebar) would otherwise own the gradient
  const gid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c6ff3d" />
          <stop offset="1" stopColor="#22e4ff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#0a0e15" />
      <path
        d="M8 34h12l5-12 8 22 6-16 4 6h13"
        fill="none"
        stroke={`url(#${gid})`}
        strokeOpacity="0.35"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 34h12l5-12 8 22 6-16 4 6h13"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
        strokeDasharray="100"
        className="animate-pulseline"
      />
    </svg>
  )
}

export default function Logo({ to = '/', size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-2xl'
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="PulseFit home">
      <PulseMark className={size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} />
      <span className={`font-display font-bold italic tracking-tighter ${text}`}>
        <span className="text-gradient">Pulse</span>
        <span>Fit</span>
      </span>
    </Link>
  )
}
