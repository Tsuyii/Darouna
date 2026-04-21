import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { MOCK, mockGardien } from '../../lib/mockData'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'approved' | 'rejected'
  scheduledAt?: string
  createdAt: string
}

const STATUS_META: Record<Task['status'], { label: string; icon: string; iconColor: string; badgeBg: string; badgeText: string; borderColor?: string }> = {
  pending:     { label: 'Pending',     icon: 'pending_actions', iconColor: 'text-error',     badgeBg: 'bg-error-container/30',      badgeText: 'text-on-error-container' },
  in_progress: { label: 'In Progress', icon: 'autorenew',       iconColor: 'text-blue-500',  badgeBg: 'bg-blue-50',                 badgeText: 'text-blue-700',            borderColor: 'border-l-4 border-blue-500/50' },
  submitted:   { label: 'Submitted',   icon: 'check_circle',    iconColor: 'text-primary',   badgeBg: 'bg-tertiary-container/20',   badgeText: 'text-on-tertiary-container' },
  completed:   { label: 'Completed',   icon: 'check_circle',    iconColor: 'text-primary',   badgeBg: 'bg-tertiary-container/20',   badgeText: 'text-on-tertiary-container' },
  approved:    { label: 'Approved',    icon: 'verified',        iconColor: 'text-primary',   badgeBg: 'bg-primary-container/20',    badgeText: 'text-on-primary-container' },
  rejected:    { label: 'Rejected',    icon: 'cancel',          iconColor: 'text-error',     badgeBg: 'bg-error-container/20',      badgeText: 'text-on-error-container' },
}

export default function GardienTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK) {
      setTasks(mockGardien.tasks as Task[])
      setLoading(false)
      return
    }
    api.get('/api/v1/tasks/gardien/my-tasks')
      .then((res) => {
        const raw = res.data.data ?? []
        // Normalize MongoDB _id → id
        setTasks(raw.map((t: Record<string, unknown>) => ({ ...t, id: t._id ?? t.id })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function startTask(id: string) {
    setUpdating(id)
    try {
      await api.put(`/api/v1/tasks/${id}/status`, { status: 'in_progress' })
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'in_progress' } : t))
    } catch { /* ignore */ } finally { setUpdating(null) }
  }

  async function submitTask(id: string) {
    setUpdating(id)
    try {
      await api.post(`/api/v1/tasks/${id}/submit`)
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'submitted' } : t))
    } catch { /* ignore */ } finally { setUpdating(null) }
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="px-6 pb-4">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-emerald-900">Today's Tasks</h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">{today}</p>
        </div>
        {!loading && (
          <span className="font-body text-xs font-semibold text-secondary">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-surface-container-lowest rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">assignment_turned_in</span>
          </div>
          <div>
            <p className="font-headline text-lg font-bold text-on-surface">All clear!</p>
            <p className="text-on-surface-variant text-sm mt-1">No tasks assigned to you today.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tasks.map((task) => {
            const sm = STATUS_META[task.status]
            const isSubmitted = task.status === 'submitted' || task.status === 'completed' || task.status === 'approved'
            const busy = updating === task.id

            return (
              <div
                key={task.id}
                className={`relative bg-surface-container-lowest rounded-xl p-6 ambient-depth transition-transform active:scale-[0.98] ${sm.borderColor ?? ''} ${isSubmitted ? 'opacity-75' : ''}`}
              >
                {/* Status row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined ${sm.iconColor}`}
                      style={isSubmitted ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {sm.icon}
                    </span>
                    <span className={`font-label text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${sm.badgeBg} ${sm.badgeText}`}>
                      {sm.label}
                    </span>
                  </div>
                  {task.scheduledAt && (
                    <span className="font-label text-[11px] font-medium text-secondary">
                      {new Date(task.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <h3 className={`font-headline text-xl font-bold text-emerald-950 mb-2 ${isSubmitted ? 'line-through opacity-60' : ''}`}>
                  {task.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
                  {task.description}
                </p>

                {/* Progress bar for in_progress */}
                {task.status === 'in_progress' && (
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-6">
                    <div className="bg-blue-500 h-full w-2/3 rounded-full" />
                  </div>
                )}

                {/* Actions */}
                {task.status === 'pending' && (
                  <button
                    onClick={() => startTask(task.id)}
                    disabled={busy}
                    className="w-full gloss-button text-white font-body text-xs font-bold py-3 rounded-lg tracking-wide hover:opacity-90 active:scale-[0.98] transition-all uppercase disabled:opacity-60"
                  >
                    {busy ? 'Starting…' : 'Start Task'}
                  </button>
                )}

                {task.status === 'in_progress' && (
                  <div className="flex gap-3">
                    <button
                      disabled={busy}
                      className="flex-1 bg-surface-container-low text-on-surface-variant font-body text-xs font-bold py-3 rounded-lg tracking-wide uppercase disabled:opacity-60"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => submitTask(task.id)}
                      disabled={busy}
                      className="flex-1 gloss-button text-white font-body text-xs font-bold py-3 rounded-lg tracking-wide uppercase disabled:opacity-60"
                    >
                      {busy ? 'Submitting…' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
