import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { MOCK, mockResidents, mockGardiens } from '../../lib/mockData'

interface Contact {
  id: string
  name: string
  role: 'resident' | 'gardien'
  apartment?: string
  building?: string
  phone?: string | null
  unread?: number
}

export default function SyndicContacts() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (MOCK) {
      const residents: Contact[] = mockResidents.map((r) => ({
        id: r.id,
        name: r.name,
        role: 'resident',
        apartment: r.apartment,
        building: r.building,
        phone: r.phone,
        unread: 0,
      }))
      const gardiens: Contact[] = mockGardiens.map((g) => ({
        id: g.id,
        name: g.name,
        role: 'gardien',
        building: g.building,
        phone: g.phone,
        unread: 0,
      }))
      setContacts([...residents, ...gardiens])
      setLoading(false)
      return
    }
    Promise.all([
      api.get('/api/v1/users/residents/list?limit=100'),
      api.get('/api/v1/users?role=gardien&limit=100'),
    ])
      .then(([rRes, gRes]) => {
        const residents: Contact[] = (rRes.data.data?.users ?? []).map((u: any) => ({
          id: u._id ?? u.id,
          name: u.name,
          role: 'resident',
          apartment: u.apartment?.number ?? u.apartment,
          building: u.building?.name ?? u.building,
          phone: u.phone ?? null,
          unread: 0,
        }))
        const gardiens: Contact[] = (gRes.data.data?.users ?? []).map((u: any) => ({
          id: u._id ?? u.id,
          name: u.name,
          role: 'gardien',
          building: u.building?.name ?? u.building,
          phone: u.phone ?? null,
          unread: 0,
        }))
        setContacts([...residents, ...gardiens])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.apartment ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const residents = filtered.filter((c) => c.role === 'resident')
  const gardiens  = filtered.filter((c) => c.role === 'gardien')

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-headline text-2xl font-black text-primary tracking-tight">Contacts</h2>
        <p className="text-on-surface-variant text-sm font-medium">Message residents & caretakers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search by name or apartment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 ambient-depth flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person_off</span>
          <p className="text-on-surface-variant text-sm">No contacts found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Residents */}
          {residents.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Residents ({residents.length})
              </p>
              <div className="space-y-2">
                {residents.map((c) => (
                  <ContactRow key={c.id} contact={c} onMessage={() => navigate(`/syndic/chat/${c.id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* Gardiens */}
          {gardiens.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Caretakers ({gardiens.length})
              </p>
              <div className="space-y-2">
                {gardiens.map((c) => (
                  <ContactRow key={c.id} contact={c} onMessage={() => navigate(`/syndic/chat/${c.id}`)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function ContactRow({ contact, onMessage }: { contact: Contact; onMessage: () => void }) {
  const initials = contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 ambient-depth flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center shrink-0">
        <span className="font-headline font-black text-white text-sm">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-on-surface truncate">{contact.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5 flex-wrap">
          {contact.apartment && (
            <>
              <span className="material-symbols-outlined text-[13px]">door_front</span>
              <span>Apt {contact.apartment}</span>
              <span>·</span>
            </>
          )}
          <span className="capitalize">{contact.role}</span>
          {contact.phone && (
            <>
              <span>·</span>
              <span>{contact.phone}</span>
            </>
          )}
        </div>
      </div>

      {/* Unread badge + message button */}
      <div className="flex items-center gap-2 shrink-0">
        {!!contact.unread && (
          <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
            {contact.unread}
          </span>
        )}
        <button
          onClick={onMessage}
          className="gloss-button text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 active:scale-[0.97] transition-transform"
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          Message
        </button>
      </div>
    </div>
  )
}
