import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

interface Message {
  id: string
  content: string
  fromMe: boolean
  senderName: string
  createdAt: string
  read: boolean
}

interface Thread {
  partner: { id: string; name: string; role: string }
  messages: Message[]
}

function timeLabel(d: string) {
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function ChatThread() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchThread = useCallback(async () => {
    if (!partnerId) return
    try {
      const res = await api.get(`/api/v1/messages/conversations/${partnerId}`)
      setThread(res.data.data)
    } catch {
      // keep previous state on poll failure
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  useEffect(() => {
    fetchThread()
    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(fetchThread, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchThread])

  // Scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !partnerId || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    // Optimistic update — show immediately
    const tempId = `temp-${Date.now()}`
    const tempMsg: Message = { id: tempId, content, fromMe: true, senderName: 'Me', createdAt: new Date().toISOString(), read: false }
    setThread((prev) => prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev)
    try {
      await api.post('/api/v1/messages', { toUserId: partnerId, content })
      await fetchThread() // replace optimistic msg with real one
    } catch {
      // Remove optimistic msg and restore text on failure
      setThread((prev) => prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== tempId) } : prev)
      setText(content)
    } finally {
      setSending(false)
    }
  }

  const backPath = role === 'syndic' ? '/syndic/contacts' : role === 'resident' ? '/resident/messages' : '/gardien/messages'

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 bg-surface-container-lowest/80 backdrop-blur-sm">
        <button
          onClick={() => navigate(backPath)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low active:scale-[0.97] transition-transform"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
        </button>
        {thread ? (
          <>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center shrink-0">
              <span className="font-headline font-black text-white text-xs">
                {thread.partner.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-on-surface">{thread.partner.name}</p>
              <p className="text-xs text-on-surface-variant capitalize">{thread.partner.role}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-on-surface-variant">Loading…</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : !thread || thread.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">chat_bubble</span>
            <p className="text-on-surface-variant text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          thread.messages.map((msg, i) => {
            const showTime =
              i === 0 ||
              new Date(msg.createdAt).getTime() - new Date(thread.messages[i - 1].createdAt).getTime() > 5 * 60 * 1000

            return (
              <div key={msg.id}>
                {showTime && (
                  <p className="text-center text-[10px] text-on-surface-variant/50 font-medium my-2">
                    {timeLabel(msg.createdAt)}
                  </p>
                )}
                <div className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.fromMe
                        ? 'gloss-button glass-glow text-white rounded-br-sm'
                        : 'glass-card text-on-surface rounded-bl-sm border border-outline-variant/10'
                    }`}
                  >
                    {msg.content}
                    <div className={`flex items-center gap-1 mt-1 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[9px] font-medium ${msg.fromMe ? 'text-white/60' : 'text-on-surface-variant/50'}`}>
                        {timeLabel(msg.createdAt)}
                      </span>
                      {msg.fromMe && (
                        <span
                          className="material-symbols-outlined text-[11px] text-white/60"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {msg.read ? 'done_all' : 'done'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 pb-4 pt-2 bg-surface-container-lowest/80 backdrop-blur-sm flex items-end gap-2"
      >
        <div className="flex-1 bg-surface-container-low rounded-2xl px-4 py-3 flex items-center min-h-[48px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e as any)
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none resize-none leading-relaxed"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-12 h-12 rounded-2xl gloss-button glass-glow text-white flex items-center justify-center shrink-0 active:scale-[0.97] transition-transform disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  )
}
