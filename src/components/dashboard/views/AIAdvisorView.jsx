import { AlertCircle, ChevronRight, Brain, TrendingUp, Zap } from 'lucide-react'
import { useAIAdvisor } from '../../../hooks/useAIAdvisor'
import { SEVERITY_STYLES } from '../dashboardConstants'

// ── AIAdvisorView ─────────────────────────────────────────────────────────────

export default function AIAdvisorView({ can, onUpgrade }) {
  const { insights, loading, error, generatedAt, cached, refresh } = useAIAdvisor(!can || can('ai_advisor'))

  if (can && !can('ai_advisor')) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col items-center justify-center py-24 text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">AI Care Advisor</h2>
          <p className="text-slate-500 text-sm max-w-sm">Unlock AI-powered pattern detection and personalized care insights. Available on Family and Pro plans.</p>
        </div>
        <button onClick={() => onUpgrade?.('ai_advisor')} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
          <Zap className="w-4 h-4 fill-white" /> Upgrade to unlock
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl">AI Care Advisor</h2>
          <p className="text-slate-500 text-sm">Pattern detection and personalized care insights</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {generatedAt && (
            <span className="text-slate-600 text-xs">
              {cached ? 'Cached · ' : ''}{new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={refresh} disabled={loading} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && !insights && (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-slate-600 text-sm">Claude is reading your care logs…</p>
        </div>
      )}

      {error && !loading && (
        <div className="glass rounded-2xl p-6 border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Couldn't generate insights</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={refresh} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Try again</button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const styles = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.low
            return (
              <div key={i} className={`glass rounded-2xl p-6 border ${styles.border}`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.tag}`}>{insight.tag}</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{insight.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{insight.body}</p>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1">
                      {insight.action} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && !insights && (
        <div className="glass rounded-2xl p-10 text-center border border-white/5">
          <Brain className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No insights yet</p>
          <p className="text-slate-500 text-sm mb-5">Start logging care activities to unlock AI-generated insights.</p>
          <button onClick={refresh} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Generate insights</button>
        </div>
      )}

      <div className="mt-6 glass rounded-2xl p-5 border border-white/5">
        <p className="text-slate-500 text-xs text-center">
          AI insights are generated from your care log data. Always consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
  )
}

