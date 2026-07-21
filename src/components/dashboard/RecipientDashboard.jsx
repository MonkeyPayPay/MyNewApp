import { Heart, LogOut } from 'lucide-react'
import { useCircle } from '../../hooks/useCircle'
import { useTasks } from '../../hooks/useTasks'
import CareTimeline from './care/CareTimeline'
import IconBadge from '../ui/IconBadge'
import IconButton from '../ui/IconButton'

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
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="flex items-center justify-between px-6 pb-4 pt-safe flex-shrink-0">
        <div className="flex items-center gap-2">
          <IconBadge icon={Heart} tone="brand" size="xs" iconClassName="fill-white" />
          <span className="text-white font-bold text-base">CareCircle</span>
        </div>
        <IconButton onClick={onLogout} variant="danger" aria-label="Sign out">
          <LogOut className="w-5 h-5" />
        </IconButton>
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
