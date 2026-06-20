import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { MOCK, mockFinanceStats, mockCharges } from '../../lib/mockData'

interface FinanceStats {
  totalRevenue: number
  monthlyExpenses: number
  netBalance: number
  pendingPayments: number
}

interface Charge {
  id: string
  apartment: string
  title: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  dueDate: string
}

const CHARGE_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  paid:    { label: 'Paid',    bg: 'bg-tertiary-container/20', text: 'text-on-tertiary-container' },
  pending: { label: 'Pending', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' },
  overdue: { label: 'Overdue', bg: 'bg-error-container/20',    text: 'text-error' },
}

const CHARGE_CATEGORIES = ['Monthly Maintenance', 'Water & Electricity', 'Special Assessment', 'Reserve Fund', 'Late Fee']

export default function SyndicFinance() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form
  const [formApt, setFormApt] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState(CHARGE_CATEGORIES[0])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (MOCK) {
      setStats(mockFinanceStats)
      setCharges(mockCharges)
      setLoading(false)
      return
    }
    async function load() {
      try {
        const cRes = await api.get('/api/v1/charges')
        // Endpoint returns { charges, total, pages }; normalise to a flat array
        // and map backend field names (_id, description, populated apartment).
        const raw = cRes.data.data?.charges ?? cRes.data.data ?? []
        const allCharges: Charge[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
          id: c._id ?? c.id,
          apartment: c.apartment?.number ? `Apt ${c.apartment.number}` : typeof c.apartment === 'string' ? c.apartment : '—',
          title: c.description ?? c.title ?? c.category ?? 'Charge',
          amount: c.amount ?? 0,
          status: c.status,
          dueDate: c.dueDate,
        }))
        setCharges(allCharges)
        // Derive stats from charges
        const revenue = allCharges.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
        const pending = allCharges.filter((c) => c.status === 'pending' || c.status === 'overdue').length
        setStats({ totalRevenue: revenue, monthlyExpenses: 0, netBalance: revenue, pendingPayments: pending })
      } catch {
        // graceful degradation
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleCreate() {
    if (!formApt.trim() || !formAmount) return
    setCreating(true)
    try {
      if (MOCK) {
        const newC: Charge = {
          id: `mock-${Date.now()}`,
          apartment: formApt,
          title: formCategory,
          amount: parseFloat(formAmount),
          status: 'pending',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
        setCharges((prev) => [newC, ...prev])
        setShowModal(false)
        setFormApt('')
        setFormAmount('')
        return
      }
      const res = await api.post('/api/v1/charges', {
        apartment: formApt,
        title: formCategory,
        amount: parseFloat(formAmount),
        category: formCategory,
      })
      const c: any = res.data.data ?? {}
      const created: Charge = {
        id: c._id ?? c.id ?? `tmp-${Date.now()}`,
        apartment: c.apartment?.number ? `Apt ${c.apartment.number}` : formApt,
        title: c.description ?? c.title ?? formCategory,
        amount: c.amount ?? parseFloat(formAmount),
        status: c.status ?? 'pending',
        dueDate: c.dueDate ?? new Date().toISOString(),
      }
      setCharges((prev) => [created, ...prev])
      setShowModal(false)
      setFormApt('')
      setFormAmount('')
    } catch { /* ignore */ } finally { setCreating(false) }
  }

  return (
    <div className="px-6 pb-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest">Syndic Overview</p>
        <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">Financial Health</h2>
      </div>

      {/* Bento metrics */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-container-lowest rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Revenue */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-depth relative overflow-hidden group flex flex-col justify-between h-36">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Revenue</p>
              <p className="font-headline text-3xl font-bold text-primary mt-1">
                {stats.totalRevenue.toLocaleString()} <span className="text-lg font-medium text-on-surface-variant">MAD</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-tertiary text-xs font-bold bg-tertiary-container/10 w-fit px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Collected this period
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pending */}
            <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth relative overflow-hidden group flex flex-col justify-between h-28">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pending</p>
                <p className="font-headline text-2xl font-bold text-on-surface mt-1">{stats.pendingPayments}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant bg-surface-container-high w-fit px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
                payments
              </div>
            </div>

            {/* Net balance */}
            <div className="rounded-xl p-5 flex flex-col justify-between h-28 shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)', boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)' }}>
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed">Net Balance</p>
                <p className="font-headline text-2xl font-bold text-white mt-1">
                  {stats.netBalance.toLocaleString()}
                  <span className="text-sm font-light text-primary-fixed/80 ml-1">MAD</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charges list */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Charges</h3>
          <span className="text-xs font-bold text-on-surface-variant">{charges.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container-lowest rounded-xl" />)}
          </div>
        ) : charges.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant text-sm font-medium ambient-depth">
            No charges yet. Use the + button to issue one.
          </div>
        ) : (
          <div className="space-y-3">
            {charges.map((c) => {
              const sm = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.pending
              return (
                <div key={c.id} className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">domain</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{c.apartment}</p>
                      <p className="text-xs text-on-surface-variant">{c.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-on-surface">{c.amount.toLocaleString()} MAD</p>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sm.bg} ${sm.text}`}>
                      {sm.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Budget Report */}
      {!loading && charges.length > 0 && (() => {
        const totalIssued   = charges.reduce((s, c) => s + c.amount, 0)
        const totalCollected = charges.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
        const totalOverdue   = charges.filter((c) => c.status === 'overdue').reduce((s, c) => s + c.amount, 0)
        const totalPending   = charges.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0)
        const collectionRate = totalIssued > 0 ? Math.round((totalCollected / totalIssued) * 100) : 0

        return (
          <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold text-on-surface">Budget Report</h3>

            {/* Collection rate bar */}
            <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-on-surface">Collection Rate</p>
                <p className="font-headline text-lg font-bold text-primary">{collectionRate}%</p>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${collectionRate}%`,
                    background: 'linear-gradient(to right, #064E3B, #10B981)',
                  }}
                />
              </div>
              <p className="text-xs text-on-surface-variant">
                {totalCollected.toLocaleString()} MAD collected out of {totalIssued.toLocaleString()} MAD issued
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Breakdown</p>
              <div>
                {[
                  { label: 'Total issued',  amount: totalIssued,    icon: 'receipt_long',    color: 'text-on-surface' },
                  { label: 'Collected',     amount: totalCollected,  icon: 'check_circle',    color: 'text-tertiary' },
                  { label: 'Pending',       amount: totalPending,    icon: 'schedule',        color: 'text-on-surface-variant' },
                  { label: 'Overdue',       amount: totalOverdue,    icon: 'warning',         color: 'text-error' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-surface-container last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${row.color}`}>{row.icon}</span>
                      <span className="text-sm text-on-surface-variant">{row.label}</span>
                    </div>
                    <span className={`font-bold text-sm ${row.color}`}>{row.amount.toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-[0_20px_40px_rgba(6,78,59,0.3)] z-50 active:scale-90 transition-transform"
        style={{ background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)', boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)' }}
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Issue Charge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-black text-on-surface">Issue New Charge</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Apartment</label>
              <input
                value={formApt}
                onChange={(e) => setFormApt(e.target.value)}
                placeholder="e.g. 1A"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount (MAD)</label>
              <input
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              >
                {CHARGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !formApt.trim() || !formAmount}
              className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-60 active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)' }}
            >
              {creating ? 'Issuing…' : 'Confirm Charge'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
