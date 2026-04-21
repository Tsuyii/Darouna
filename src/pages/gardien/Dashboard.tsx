import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { MOCK, mockGardien } from '../../lib/mockData'

interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

export default function GardienDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (MOCK) {
      setStats(mockGardien.stats)
      setLoading(false)
      return
    }
    // /api/v1/tasks/stats doesn't exist — compute from gardien task list
    api.get('/api/v1/tasks/gardien/my-tasks')
      .then((res) => {
        const tasks: { status: string }[] = res.data.data ?? []
        setStats({
          total:      tasks.length,
          pending:    tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          completed:  tasks.filter((t) => t.status === 'completed' || t.status === 'approved' || t.status === 'submitted_for_approval').length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="px-6 space-y-10 pb-4">
      {/* Today summary hero */}
      <section>
        <div className="relative bg-gradient-to-tr from-[#064E3B] to-[#10B981] rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-label uppercase tracking-widest opacity-80 font-bold">{today}</p>
            <h2 className="font-headline text-3xl font-black tracking-tight">Today's Summary</h2>
            <p className="text-white/70 text-sm">Your maintenance overview for the day</p>
          </div>
        </div>
      </section>

      {/* Task stats grid */}
      <section className="grid grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-lowest rounded-2xl animate-pulse" />
          ))
        ) : (
          [
            { label: 'Total',       value: stats?.total ?? 0,      icon: 'assignment',         bg: 'bg-primary-fixed/30',       text: 'text-primary' },
            { label: 'Pending',     value: stats?.pending ?? 0,    icon: 'pending_actions',    bg: 'bg-error-container/40',     text: 'text-error' },
            { label: 'In Progress', value: stats?.inProgress ?? 0, icon: 'autorenew',          bg: 'bg-secondary-container/50', text: 'text-secondary' },
            { label: 'Completed',   value: stats?.completed ?? 0,  icon: 'check_circle',       bg: 'bg-tertiary-container/20',  text: 'text-tertiary' },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container-lowest p-5 rounded-2xl ambient-depth space-y-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.text}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                <p className="font-headline text-2xl font-extrabold">{item.value}</p>
              </div>
            </div>
          ))
        )}
      </section>

      {/* CTA */}
      <section>
        <button
          onClick={() => navigate('/gardien/tasks')}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 glass-glow hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">assignment</span>
          View My Tasks
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </section>

      {/* Property visual */}
      <section>
        <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#064E3B] to-[#10B981]">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-xl">
            <h4 className="font-headline text-base font-bold text-emerald-950">Résidence Al-Andalus</h4>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">Scheduled maintenance active today</p>
          </div>
        </div>
      </section>
    </div>
  )
}
