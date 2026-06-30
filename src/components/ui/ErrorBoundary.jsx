import { Component } from 'react'
import { Heart, RefreshCw } from 'lucide-react'

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
      <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/30">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Refreshing the page usually fixes it.
          </p>
          {this.state.error && (
            <p className="text-slate-700 text-xs font-mono mb-6 bg-white/5 rounded-lg px-3 py-2 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Refresh page
          </button>
        </div>
      </div>
    )
  }
}
