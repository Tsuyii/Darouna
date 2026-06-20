import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assistantApi, type AssistantMessage } from '../../lib/assistant'
import MascotMedia from './MascotMedia'

type Role = 'syndic' | 'resident' | 'gardien'

const EXAMPLE_SETS: Record<string, Record<Role, string[]>> = {
  en: {
    resident: ['What do I owe right now?', 'Show my payment history', 'Any new announcements?'],
    gardien: ['What tasks do I have today?', "What's still in progress?", 'Any new announcements?'],
    syndic: ["What's our collection rate?", 'Any overdue charges?', 'Show open complaints'],
  },
  fr: {
    resident: ['Combien dois-je payer ?', 'Mon historique de paiements', 'Nouvelles annonces ?'],
    gardien: ["Quelles tâches aujourd'hui ?", "Qu'est-ce qui est en cours ?", 'Nouvelles annonces ?'],
    syndic: ['Quel est notre taux de recouvrement ?', 'Des charges en retard ?', 'Réclamations ouvertes'],
  },
  ar: {
    resident: ['كم عليّ أن أدفع الآن؟', 'اعرض سجل مدفوعاتي', 'هل هناك إعلانات جديدة؟'],
    gardien: ['ما مهامي اليوم؟', 'ما الذي قيد التنفيذ؟', 'هل هناك إعلانات جديدة؟'],
    syndic: ['ما نسبة التحصيل لدينا؟', 'هل توجد رسوم متأخرة؟', 'اعرض الشكاوى المفتوحة'],
  },
}

interface AssistantSheetProps {
  open: boolean
  onClose: () => void
  role: Role
  userName: string
}

// Renders plain text with **bold** spans and preserved line breaks.
function FormattedText({ text }: { text: string }) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-bold text-on-surface">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </span>
  )
}

export default function AssistantSheet({ open, onClose, role, userName }: AssistantSheetProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Example chips kept as a local constant (crash-proof; not dependent on
  // i18next returnObjects, which is unreliable here).
  const lang = (i18n?.language || 'en').slice(0, 2)
  const examples: string[] = (EXAMPLE_SETS[lang] || EXAMPLE_SETS.en)[role]

  // Load persisted history the first time the sheet opens.
  useEffect(() => {
    if (!open || historyLoaded) return
    assistantApi
      .history()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setHistoryLoaded(true))
  }, [open, historyLoaded])

  // Focus the composer and lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 350)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  // Keep the conversation pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: trimmed }])
    setLoading(true)
    try {
      const { reply, suggestedAction } = await assistantApi.send(trimmed)
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: reply, suggestedAction: suggestedAction ?? undefined },
      ])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('assistant.error') }])
    } finally {
      setLoading(false)
    }
  }

  async function clearChat() {
    try {
      await assistantApi.clear()
    } catch {
      /* ignore */
    }
    setMessages([])
  }

  function goTo(route: string) {
    onClose()
    navigate(route)
  }

  if (!open) return null

  const isEmpty = messages.length === 0 && !loading

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={t('assistant.title')}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Scrim */}
      <button
        className="assistant-scrim absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
        aria-label={t('assistant.close')}
        onClick={onClose}
      />

      {/* Sheet */}
      <section className="assistant-sheet absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[32px] bg-surface-container-lowest/85 backdrop-blur-xl ambient-depth">
        {/* Grab handle */}
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-on-surface/15" />

        {/* Header */}
        <header className="flex items-center gap-3 px-5 pb-3 pt-2">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] glass-glow">
            <img src="/assistant/mascot.png" alt="" aria-hidden className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-lg font-extrabold leading-tight text-on-surface">
              {t('assistant.title')}
            </h2>
            <p className="truncate text-xs text-on-surface-variant">{t('assistant.subtitle')}</p>
          </div>
          <button
            onClick={clearChat}
            aria-label={t('assistant.clear')}
            className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </button>
          <button
            onClick={onClose}
            aria-label={t('assistant.close')}
            className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-3">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-4 px-2 py-6 text-center">
              <MascotMedia clip="wave" loop={false} className="h-28 w-28 object-contain" />
              <p className="max-w-xs font-body text-sm text-on-surface-variant">
                {t('assistant.greeting', { name: userName })}
              </p>
              <div className="mt-1 flex w-full flex-col gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => send(ex)}
                    className="rounded-2xl bg-primary-fixed/40 px-4 py-3 text-start text-sm font-semibold text-on-primary-container transition-transform active:scale-[0.98]"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start gap-2'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#064E3B] to-[#10B981] px-4 py-2.5 text-sm text-on-primary shadow-sm'
                      : 'max-w-[88%] rounded-2xl rounded-bl-md bg-surface-container-low px-4 py-2.5 text-sm text-on-surface'
                  }
                >
                  <FormattedText text={m.content} />
                </div>
                {m.role === 'assistant' && m.suggestedAction && (
                  <button
                    onClick={() => goTo(m.suggestedAction!.route)}
                    className="gloss-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-on-primary active:scale-95"
                  >
                    {m.suggestedAction.label}
                    <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                  </button>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-end gap-2">
              <MascotMedia clip="smile" className="h-10 w-10 shrink-0 object-contain" />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-container-low px-4 py-3">
                <span className="assistant-dot h-2 w-2 rounded-full bg-on-surface-variant/60" />
                <span className="assistant-dot h-2 w-2 rounded-full bg-on-surface-variant/60" />
                <span className="assistant-dot h-2 w-2 rounded-full bg-on-surface-variant/60" />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-end gap-2 rounded-[28px] bg-surface-container-low p-1.5 pl-4">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              rows={1}
              placeholder={t('assistant.placeholder')}
              className="max-h-28 flex-1 resize-none bg-transparent py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              aria-label={t('assistant.send')}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] text-on-primary transition-opacity disabled:opacity-40 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] rtl:rotate-180">send</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
