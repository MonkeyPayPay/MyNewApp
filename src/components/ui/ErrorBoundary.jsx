import { Component } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import Button from './Button'
import IconBadge from './IconBadge'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <IconBadge icon={Heart} tone="brand" size="xl" iconClassName="fill-white" className="mx-auto mb-5 shadow-xl shadow-indigo-500/30" />
          <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Refreshing the page usually fixes it.
          </p>
          {this.state.error && (
            <p className="text-slate-700 text-xs font-mono mb-6 bg-white/5 rounded-lg px-3 py-2 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" /> Refresh page
          </Button>
        </div>
      </div>
    )
  }
}
