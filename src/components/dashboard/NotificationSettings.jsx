import { Bell, Mail, CheckCircle, Loader } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const PREF_CONFIG = [
  {
    key: 'email_task_assigned',
    label: 'Task assigned to you',
    description: 'When a family member assigns you a task',
    icon: '📋',
  },
  {
    key: 'email_feed_entry',
    label: 'New care log entry',
    description: 'When someone logs a care update',
    icon: '📝',
  },
  {
    key: 'email_invite_accepted',
    label: 'Family member joins',
    description: 'When someone accepts a circle invitation',
    icon: '👋',
  },
  {
    key: 'email_expense_added',
    label: 'New expense logged',
    description: 'When a caregiving expense is added',
    icon: '💰',
  },
  {
    key: 'email_weekly_digest',
    label: 'Weekly care digest',
    description: 'Monday morning summary of the past week',
    icon: '📊',
  },
]

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? 'bg-indigo-600' : 'bg-white/15'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function NotificationSettings() {
  const { prefs, loading, saving, updatePref } = useNotifications()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">Notification Preferences</h2>
          <p className="text-slate-500 text-sm">Choose what emails CareCircle sends you</p>
        </div>
        {saving && (
          <div className="ml-auto flex items-center gap-2 text-slate-500 text-sm">
            <Loader className="w-3.5 h-3.5 animate-spin" /> Saving…
          </div>
        )}
      </div>

      <div className="glass rounded-2xl divide-y divide-white/5 overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-2 bg-white/3">
          <Mail className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500 text-xs uppercase tracking-widest font-medium">Email notifications</span>
        </div>

        {PREF_CONFIG.map((item) => (
          <div key={item.key} className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
            </div>
            <Toggle
              enabled={prefs[item.key] ?? false}
              onChange={(val) => updatePref(item.key, val)}
            />
          </div>
        ))}
      </div>

      <p className="text-slate-600 text-xs text-center mt-6">
        Changes save automatically. You can also unsubscribe from any individual email.
      </p>
    </div>
  )
}
