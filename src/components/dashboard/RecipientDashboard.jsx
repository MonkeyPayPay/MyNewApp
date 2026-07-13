import { Heart, LogOut } from 'lucide-react'
import { useCircle } from '../../hooks/useCircle'
import { useTasks } from '../../hooks/useTasks'
import CareTimeline from './care/CareTimeline'

/**
 * A deliberately narrower shell for the person actually receiving care —
 * their medication and mood check-ins, nothing administrative. No
 * sidebar, no billing, no task creation, no other family members' data
 * beyond what the Right Now timeline already shows them.
 */
export default function RecipientDashboard({ onLogout }) {
  const { circle, recipient, members } = useCircle()
  const { tasks, toggleTask } = useTasks(circle?.id)

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      <header className="flex items-center justify-between px-6 pb-4 pt-safe flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-white font-bold text-base">CareCircle</span>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-rose-400 rounded-full hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-safe">
        <CareTimeline
          circleId={circle?.id}
          recipient={recipient}
          members={members}
          tasks={tasks}
          toggleTask={toggleTask}
          addTask={async () => {}}
          can={() => true}
          onUpgrade={() => {}}
          onNavigate={() => {}}
          simplified
        />
      </main>
    </div>
  )
}
