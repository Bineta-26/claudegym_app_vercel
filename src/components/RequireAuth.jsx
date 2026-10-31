import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSkeleton, ConnectionError } from './ui'

export default function RequireAuth({ children }) {
  const { user, loading, error, refresh } = useAuth()
  const location = useLocation()

  if (loading) return <PageSkeleton />
  if (error) return <ConnectionError error={error} onRetry={refresh} />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
