import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { MOCK, mockConversations } from '../../lib/mockData'

interface Conversation {
  partner: { id: string; name: string; role: string }
  lastMessage: { content: string; createdAt: string; fromMe: boolean }
  unread: number
}

function timeLabel(d: string) {
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const ROLE_ICON: Record<string, string> = {
  syndic:  'manage_accounts',
  gardien: 'engineering',
  resident:'person',
}

export default function ResidentMessages() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (MOCK) {
      setConversations(mockConversations as Conversation[])
      setLoading(false)
      return
    }
    api.get('/api/v1/messages/conversations')
      .then((res) => setConversations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-black text-primary tracking-tight">Messages</h2>
          <p className="text-on-surface-variant text-sm font-medium">
            {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 ambient-depth flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">chat_bubble_outline</span>
          <p className="text-on-surface-variant text-sm">No conversations yet.</p>
          <p className="text-on-surface-variant/60 text-xs">Your syndic or caretaker can reach you here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const initials = conv.partner.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <button
                key={conv.partner.id}
                onClick={() => navigate(`/resident/chat/${conv.partner.id}`)}
                className="w-full bg-surface-container-lowest rounded-2xl p-4 ambient-depth flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center">
                    <span className="font-headline font-black text-white text-sm">{initials}</span>
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>
                      {conv.partner.name}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/60 shrink-0">
                      {timeLabel(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[13px]">
                      {ROLE_ICON[conv.partner.role] ?? 'person'}
                    </span>
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                      {conv.lastMessage.fromMe ? 'You: ' : ''}{conv.lastMessage.content}
                    </p>
                  </div>
                </div>

                <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px] shrink-0">chevron_right</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
