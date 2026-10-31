import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PulseFit crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <div className="glass max-w-md p-8 text-center">
          <p className="mb-3 text-5xl">😮‍💨</p>
          <h2 className="text-2xl font-bold">Whoa, we pulled a muscle.</h2>
          <p className="muted mt-2">
            Something went wrong on this screen. Your progress is safe. Give it another rep.
          </p>
          <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
            <RefreshCw size={18} /> Try again
          </button>
        </div>
      </div>
    )
  }
}
