import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { MOCK, mockResidentCharges, mockPaymentHistory } from '../../lib/mockData'

interface Charge {
  id: string
  title: string
  type?: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  dueDate: string
}

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  createdAt: string
  charge?: { title: string }
}

const CHARGE_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  paid:    { label: 'Paid',    bg: 'bg-tertiary-container/10', text: 'text-tertiary' },
  pending: { label: 'Pending', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' },
  overdue: { label: 'Overdue', bg: 'bg-error-container/20',    text: 'text-error' },
}

const METHOD_ICON: Record<string, string> = {
  bank_transfer: 'account_balance',
  cash:          'payments',
  card:          'credit_card',
}

const PAYMENT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: 'Paid',    bg: 'bg-tertiary-container/10', text: 'text-tertiary' },
  pending:   { label: 'Pending', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' },
  failed:    { label: 'Failed',  bg: 'bg-error-container/20',    text: 'text-error' },
}

const TABS = ['Charges', 'Payments'] as const
type Tab = typeof TABS[number]

type PayStep = 'select' | 'method' | 'details' | 'processing' | 'success'
type PayMethod = 'card' | 'bank_transfer' | 'cash'

interface CardDetails { number: string; expiry: string; cvv: string; name: string }
interface BankDetails { rib: string; bankName: string }

function generateRef() {
  return 'MOCK-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000)
}

// ─── Payment Sheet ────────────────────────────────────────────────────────────

function PaymentSheet({
  charges,
  initialCharge,
  onClose,
  onSuccess,
}: {
  charges: Charge[]
  initialCharge: Charge | null
  onClose: () => void
  onSuccess: (chargeId: string, method: PayMethod) => void
}) {
  const unpaid = charges.filter((c) => c.status !== 'paid')
  const [step, setStep] = useState<PayStep>(initialCharge ? 'method' : 'select')
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(initialCharge)
  const [method, setMethod] = useState<PayMethod | null>(null)
  const [card, setCard] = useState<CardDetails>({ number: '', expiry: '', cvv: '', name: '' })
  const [bank, setBank] = useState<BankDetails>({ rib: '', bankName: '' })
  const [ref] = useState(generateRef)

  // Format card number with spaces
  function fmtCard(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function fmtExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  function handleConfirm() {
    if (!selectedCharge || !method) return
    setStep('processing')
    setTimeout(async () => {
      if (!MOCK) {
        try {
          await api.post('/api/v1/payments', {
            chargeId: selectedCharge.id,
            method,
            amount: selectedCharge.amount,
          })
        } catch {
          // graceful — still show mock success
        }
      }
      setStep('success')
    }, 2200)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={step === 'processing' ? undefined : onClose}
      />

      {/* Sheet */}
      <div

        className="relative w-full bg-surface rounded-t-[32px] shadow-2xl overflow-hidden"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 20px)' }}>
          {/* ── STEP: SELECT CHARGE ── */}
          {step === 'select' && (
            <div className="px-6 pb-8">
              <h2 className="font-headline text-xl font-black text-on-surface mt-2 mb-1">Select a charge to pay</h2>
              <p className="text-xs text-outline mb-6">Choose which outstanding balance you'd like to settle.</p>
              <div className="space-y-3">
                {unpaid.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-8">No outstanding charges.</p>
                )}
                {unpaid.map((c) => {
                  const sm = CHARGE_STATUS[c.status]
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCharge(c); setStep('method') }}
                      className="w-full text-left bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between ambient-depth hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                    >
                      <div>
                        <p className="font-bold text-sm text-on-surface">{c.title}</p>
                        <p className="text-[10px] text-outline mt-0.5">
                          Due {new Date(c.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-bold text-sm text-on-surface">{c.amount.toLocaleString()} MAD</p>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sm.bg} ${sm.text}`}>
                          {sm.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STEP: METHOD ── */}
          {step === 'method' && selectedCharge && (
            <div className="px-6 pb-8">
              <button onClick={() => initialCharge ? onClose() : setStep('select')} className="flex items-center gap-1 text-primary text-xs font-bold mt-2 mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back
              </button>
              {/* Charge summary */}
              <div className="bg-gradient-to-br from-[#064E3B] to-[#10B981] rounded-xl p-4 mb-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Paying for</p>
                <p className="font-headline font-bold text-base">{selectedCharge.title}</p>
                <p className="font-headline text-3xl font-black mt-2">{selectedCharge.amount.toLocaleString()} <span className="text-lg font-bold opacity-80">MAD</span></p>
              </div>
              <h2 className="font-headline text-lg font-black text-on-surface mb-4">Choose payment method</h2>
              <div className="space-y-3">
                {([
                  { id: 'card' as PayMethod,          label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, CIB',        icon: 'credit_card' },
                  { id: 'bank_transfer' as PayMethod, label: 'Bank Transfer',         sub: 'CCP, Wafa, Banque Populaire',  icon: 'account_balance' },
                  { id: 'cash' as PayMethod,          label: 'Cash at reception',     sub: 'Pay in person to the syndic',  icon: 'payments' },
                ] as { id: PayMethod; label: string; sub: string; icon: string }[]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setStep('details') }}
                    className="w-full text-left bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 ambient-depth hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{m.label}</p>
                      <p className="text-[10px] text-outline">{m.sub}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline ml-auto" style={{ fontSize: 18 }}>chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === 'details' && selectedCharge && method && (
            <div className="px-6 pb-8">
              <button onClick={() => setStep('method')} className="flex items-center gap-1 text-primary text-xs font-bold mt-2 mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back
              </button>

              {/* Amount reminder */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline">Amount due</p>
                  <p className="font-headline text-2xl font-black text-on-surface">{selectedCharge.amount.toLocaleString()} MAD</p>
                </div>
                <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>{METHOD_ICON[method]}</span>
                  <span className="text-xs font-bold text-on-surface capitalize">{method.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Card form */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">Card number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">Cardholder name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">Expiry</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: fmtExpiry(e.target.value) })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">CVV</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        maxLength={4}
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-outline/70 text-center pt-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock</span>
                    Mock interface — no real payment processed
                  </p>
                </div>
              )}

              {/* Bank transfer form */}
              {method === 'bank_transfer' && (
                <div className="space-y-3">
                  <div className="bg-secondary-container/20 rounded-xl p-4 mb-2">
                    <p className="text-xs font-bold text-on-surface mb-1">Syndic bank details</p>
                    <p className="text-[10px] text-outline">Résidence Al Andalus</p>
                    <p className="text-[10px] text-outline font-mono mt-1">RIB: 230 780 0123456789012 34</p>
                    <p className="text-[10px] text-outline">Banque Populaire — Casablanca</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">Your RIB / Account ref.</label>
                    <input
                      type="text"
                      placeholder="Your RIB or transfer reference"
                      value={bank.rib}
                      onChange={(e) => setBank({ ...bank, rib: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1.5">Your bank</label>
                    <input
                      type="text"
                      placeholder="e.g. Banque Populaire"
                      value={bank.bankName}
                      onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 outline-none focus:bg-surface-container transition-colors font-body"
                    />
                  </div>
                  <p className="text-[10px] text-outline/70 text-center pt-1">
                    Syndic will confirm receipt within 24–48h.
                  </p>
                </div>
              )}

              {/* Cash */}
              {method === 'cash' && (
                <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>payments</span>
                  </div>
                  <p className="font-bold text-on-surface text-sm">Pay at reception</p>
                  <p className="text-xs text-outline leading-relaxed">
                    Bring <strong className="text-on-surface">{selectedCharge.amount.toLocaleString()} MAD</strong> in cash to the syndic office or building reception.<br />
                    You'll receive a signed receipt. The syndic will then confirm it in the system.
                  </p>
                  <p className="text-[10px] text-outline/70">Office hours: Mon–Fri 9h–17h</p>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={
                  (method === 'card' && (!card.number || !card.name || !card.expiry || !card.cvv)) ||
                  (method === 'bank_transfer' && !bank.rib)
                }
                className="mt-6 w-full py-4 rounded-xl gloss-button text-white font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                Confirm payment — {selectedCharge.amount.toLocaleString()} MAD
              </button>
            </div>
          )}

          {/* ── STEP: PROCESSING ── */}
          {step === 'processing' && (
            <div className="px-6 pb-12 flex flex-col items-center justify-center min-h-[300px] gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] opacity-20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>payments</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-headline font-bold text-on-surface text-lg">Processing payment…</p>
                <p className="text-xs text-outline mt-1">Please wait, do not close this window</p>
              </div>
              <div className="w-48 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#064E3B] to-[#10B981] rounded-full" style={{ transformOrigin: 'left', animation: 'progress 2.2s ease-in-out forwards' }} />
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && selectedCharge && method && (
            <div className="px-6 pb-10">
              {/* Success hero */}
              <div className="bg-gradient-to-br from-[#064E3B] to-[#10B981] rounded-2xl p-6 mb-6 text-white text-center relative overflow-hidden mt-2">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-150" />
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <p className="font-headline text-xl font-black">Payment submitted!</p>
                <p className="text-xs opacity-80 mt-1">Your payment has been received.</p>
              </div>

              {/* Receipt card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Receipt</p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Reference</span>
                  <span className="text-xs font-bold text-on-surface font-mono">{ref}</span>
                </div>
                <div className="h-px bg-surface-container" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Charge</span>
                  <span className="text-xs font-bold text-on-surface">{selectedCharge.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Amount</span>
                  <span className="text-xs font-bold text-on-surface">{selectedCharge.amount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Method</span>
                  <span className="text-xs font-bold text-on-surface capitalize">{method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Date</span>
                  <span className="text-xs font-bold text-on-surface">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-outline">Status</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-tertiary-container/10 text-tertiary">
                    {method === 'cash' || method === 'bank_transfer' ? 'Awaiting confirmation' : 'Completed'}
                  </span>
                </div>
              </div>

              {method !== 'card' && (
                <p className="text-[10px] text-outline text-center mt-3 leading-relaxed">
                  {method === 'cash'
                    ? 'The syndic will confirm your cash payment after collection.'
                    : 'The syndic will confirm once the bank transfer is received (24–48h).'}
                </p>
              )}

              <button
                onClick={() => { onSuccess(selectedCharge.id, method); onClose() }}
                className="mt-5 w-full py-4 rounded-xl gloss-button text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResidentLedger() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('Charges')

  // Payment sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetCharge, setSheetCharge] = useState<Charge | null>(null)

  useEffect(() => {
    if (MOCK) {
      setCharges(mockResidentCharges)
      setPayments(mockPaymentHistory)
      setLoading(false)
      return
    }
    async function load() {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/api/v1/charges'),
          api.get('/api/v1/payments/resident/history'),
        ])
        const rawCharges = cRes.data.data?.charges ?? cRes.data.data ?? []
        setCharges(rawCharges.map((c: any) => ({
          id: c._id ?? c.id,
          title: c.description ?? c.title,
          type: c.category ?? c.type,
          amount: c.amount,
          status: c.status,
          dueDate: c.dueDate,
        })))
        const rawPayments = pRes.data.data ?? []
        setPayments(rawPayments.map((p: any) => ({
          id: p._id ?? p.id,
          amount: p.amount,
          method: p.paymentMethod ?? p.method,
          status: p.status,
          createdAt: p.createdAt,
          charge: p.charge ? { title: p.charge.description ?? p.charge.title } : undefined,
        })))
      } catch {
        // graceful degradation
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const outstanding = charges
    .filter((c) => c.status !== 'paid')
    .reduce((s, c) => s + c.amount, 0)

  const nextDue = charges
    .filter((c) => c.status === 'pending' || c.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  function openPayAll() {
    setSheetCharge(null)
    setSheetOpen(true)
  }

  function openPayCharge(c: Charge) {
    setSheetCharge(c)
    setSheetOpen(true)
  }

  function handlePaySuccess(chargeId: string, method: PayMethod) {
    // Update local state optimistically
    setCharges((prev) =>
      prev.map((c) => c.id === chargeId ? { ...c, status: 'paid' } : c)
    )
    setPayments((prev) => [
      {
        id: 'new-' + Date.now(),
        amount: charges.find((c) => c.id === chargeId)?.amount ?? 0,
        method,
        status: method === 'card' ? 'completed' : 'pending',
        createdAt: new Date().toISOString(),
        charge: { title: charges.find((c) => c.id === chargeId)?.title ?? '' },
      },
      ...prev,
    ])
  }

  const unpaidCount = charges.filter((c) => c.status !== 'paid').length

  return (
    <>
      <div className="px-6 pb-8 space-y-8">
        {/* Hero */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative bg-gradient-to-br from-[#064E3B] to-[#10B981] rounded-xl p-6 text-white shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <p className="font-label text-[10px] uppercase tracking-widest opacity-80 mb-1">Total Outstanding Balance</p>
            {loading ? (
              <div className="animate-pulse h-12 w-2/3 bg-white/20 rounded-xl mt-2" />
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline text-4xl font-black tracking-tight">{outstanding.toLocaleString()}</span>
                <span className="font-headline text-lg font-bold opacity-90">MAD</span>
              </div>
            )}
            {nextDue && (
              <p className="text-[10px] opacity-70 mt-2">
                Next due: {new Date(nextDue.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-lg active:scale-95 transition-all">
                Statement
              </button>
              <button
                onClick={openPayAll}
                disabled={unpaidCount === 0}
                className="bg-surface-container-lowest text-primary text-xs font-bold px-5 py-2.5 rounded-lg shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pay Now
              </button>
            </div>
          </div>

          {/* Account status card */}
          <div className="bg-surface-container-lowest rounded-xl p-5 ambient-depth flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Account Status</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container/10 text-tertiary mt-2">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                Active
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Charges</p>
              <p className="text-xl font-headline font-bold text-on-surface mt-1">{charges.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Payments</p>
              <p className="text-xl font-headline font-bold text-on-surface mt-1">{payments.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                tab === t
                  ? 'bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white shadow-lg shadow-emerald-900/20'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container-lowest rounded-xl" />)}
          </div>
        ) : tab === 'Charges' ? (
          <div className="space-y-3">
            {charges.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant text-sm font-medium ambient-depth">
                No charges yet.
              </div>
            ) : charges.map((c) => {
              const sm = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.pending
              const canPay = c.status !== 'paid'
              return (
                <div key={c.id} className="bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between ambient-depth group hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-white transition-colors">
                      <span className="material-symbols-outlined">home</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{c.title}</p>
                      <p className="text-[10px] text-outline font-medium">
                        Due: {new Date(c.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-bold text-sm text-on-surface">{c.amount.toLocaleString()} MAD</p>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sm.bg} ${sm.text}`}>
                      {sm.label}
                    </span>
                    {canPay && (
                      <button
                        onClick={() => openPayCharge(c)}
                        className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors active:scale-95"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant text-sm font-medium ambient-depth">
                No payments yet.
              </div>
            ) : payments.map((p) => {
              const sm = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending
              const icon = METHOD_ICON[p.method] ?? 'payments'
              return (
                <div key={p.id} className="bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between ambient-depth group hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-white transition-colors">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{p.charge?.title ?? 'Payment'}</p>
                      <p className="text-[10px] text-outline font-medium capitalize">
                        {p.method.replace('_', ' ')} • {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-sm text-on-surface">{p.amount.toLocaleString()} MAD</p>
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

      {/* Payment Sheet */}
      {sheetOpen && (
        <PaymentSheet
          charges={charges}
          initialCharge={sheetCharge}
          onClose={() => { setSheetOpen(false); setSheetCharge(null) }}
          onSuccess={handlePaySuccess}
        />
      )}

      {/* Progress bar keyframe */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </>
  )
}
