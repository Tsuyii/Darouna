import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { MOCK, mockResident } from '../../lib/mockData'

interface Charge {
  id: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
}

interface Announcement {
  id: string
  title: string
  content: string
  type?: string
  createdAt: string
}

const ANNOUNCE_TYPE_META: Record<string, { label: string; bg: string; text: string }> = {
  urgent:      { label: 'Urgent',      bg: 'bg-error-container/10',        text: 'text-error' },
  emergency:   { label: 'Urgent',      bg: 'bg-error-container/10',        text: 'text-error' },
  event:       { label: 'Event',       bg: 'bg-tertiary-container/10',     text: 'text-tertiary' },
  maintenance: { label: 'Maintenance', bg: 'bg-secondary-container/20',    text: 'text-secondary' },
  general:     { label: 'Info',        bg: 'bg-secondary-container/20',    text: 'text-secondary' },
  info:        { label: 'Info',        bg: 'bg-secondary-container/20',    text: 'text-secondary' },
}

export default function ResidentDashboard() {
  const navigate = useNavigate()
  const [charges, setCharges] = useState<Charge[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (MOCK) {
      setCharges(mockResident.charges)
      setAnnouncements(mockResident.announcements)
      setLoading(false)
      return
    }
    async function load() {
      try {
        const [chargesRes, announcementsRes] = await Promise.all([
          api.get('/api/v1/charges'),
          api.get('/api/v1/announcements'),
        ])
        // Normalize MongoDB _id → id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const norm = (arr: any[]) => arr.map((x) => ({ ...x, id: x._id ?? x.id }))
        setCharges(norm(chargesRes.data.data ?? []))
        setAnnouncements(norm(announcementsRes.data.data ?? []).slice(0, 3))
      } catch {
        // graceful degradation
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingCharge = charges.find((c) => c.status === 'pending' || c.status === 'overdue')
  const balance = charges.filter((c) => c.status !== 'paid').reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="px-6 space-y-10 pb-4">
      {/* Hero: Balance */}
      <section>
        <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white shadow-xl shadow-emerald-900/10">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                Account Summary
              </span>
              <h2 className="font-headline text-sm font-semibold">Outstanding Balance</h2>
              {loading ? (
                <div className="animate-pulse h-12 w-2/3 bg-white/20 rounded-xl" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-5xl font-black tracking-tight">
                    {balance.toLocaleString()}
                  </span>
                  <span className="font-headline text-xl font-bold opacity-90">MAD</span>
                </div>
              )}
              {pendingCharge && (
                <p className="font-label text-[10px] opacity-70 pt-1">
                  Due: {new Date(pendingCharge.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <button className="glass-glow bg-white text-[#064E3B] font-body font-bold py-4 px-8 rounded-lg shadow-lg hover:scale-[0.98] active:scale-[0.96] transition-transform flex items-center justify-center gap-2 self-start">
              <span>Pay Now</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid: Quick Insights */}
      <section className="grid grid-cols-2 gap-4">
        {[
          { icon: 'key',            bg: 'bg-primary-fixed/30',          text: 'text-primary',    label: 'Access Codes',  value: 'Active' },
          { icon: 'water_drop',     bg: 'bg-tertiary-container/20',     text: 'text-tertiary',   label: 'Water Usage',   value: 'Normal' },
          { icon: 'local_shipping', bg: 'bg-secondary-container/50',    text: 'text-secondary',  label: 'Deliveries',    value: '2 today' },
          { icon: 'engineering',    bg: 'bg-error-container/40',        text: 'text-error',      label: 'Tickets',       value: '1 open' },
        ].map((item) => (
          <div key={item.label} className="bg-surface-container-lowest p-5 rounded-xl ambient-depth space-y-3">
            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.text}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
              <p className="font-headline text-xl font-extrabold">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Building Feed */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="font-headline text-2xl font-black text-on-surface">Building Feed</h3>
          <button onClick={() => navigate('/resident/announcements')} className="font-body text-xs font-bold text-primary hover:underline">View All</button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-surface-container-lowest rounded-xl" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-6 text-center text-on-surface-variant text-sm font-medium ambient-depth">
            No announcements yet — check back soon.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const type = ann.type?.toLowerCase() ?? 'info'
              const tm = ANNOUNCE_TYPE_META[type] ?? ANNOUNCE_TYPE_META.info
              return (
                <article
                  key={ann.id}
                  className="bg-surface-container-lowest rounded-xl p-6 ambient-depth flex flex-col gap-2 group hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className={`${tm.bg} ${tm.text} px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest`}>
                      {tm.label}
                    </span>
                    <span className="text-on-surface-variant/60 text-[10px] font-bold font-label">
                      {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                    {ann.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Votes shortcut */}
      <section>
        <button
          onClick={() => navigate('/resident/votes')}
          className="w-full bg-surface-container-lowest rounded-2xl p-5 ambient-depth flex items-center gap-4 active:scale-[0.98] transition-transform group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary text-2xl">how_to_vote</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-headline font-black text-on-surface text-sm">Building Votes</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Participate in community decisions</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
        </button>
      </section>
    </div>
  )
}
