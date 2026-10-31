import { Routes, Route, Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Layout from './components/Layout'
import Toaster from './components/Toaster'
import ErrorBoundary from './components/ErrorBoundary'
import RequireAuth from './components/RequireAuth'
import { EmptyState, Page } from './components/ui'
import Landing from './pages/Landing'
import { Login, Signup } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'

function NotFound() {
  return (
    <Page className="mx-auto max-w-lg pt-16">
      <EmptyState
        icon={Compass}
        title="This page skipped leg day"
        message="We couldn't find what you were looking for. Let's get you back on track."
        action={<Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>}
      />
    </Page>
  )
}

const guard = (el) => <RequireAuth>{el}</RequireAuth>

export default function App() {
  return (
    <>
      <div className="bg-aurora" />
      <Toaster />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={guard(<Dashboard />)} />
            <Route path="/library" element={guard(<Library />)} />
            <Route path="/workout" element={guard(<LiveWorkout />)} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </>
  )
}
