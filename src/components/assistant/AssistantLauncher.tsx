import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import AssistantSheet from './AssistantSheet'

type Role = 'syndic' | 'resident' | 'gardien'

// Pages that have their own bottom-right FAB — the mascot lifts above it there.
const PAGES_WITH_FAB = ['/syndic/finance']

// Floating mascot launcher + assistant sheet. Mounted once in DashboardLayout so
// it rides along on every authenticated screen.
export default function AssistantLauncher({ role }: { role: Role }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? ''

  const bottomClass = PAGES_WITH_FAB.includes(location.pathname) ? 'bottom-44' : 'bottom-24'

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('assistant.open')}
          className={`assistant-fab fixed ${bottomClass} end-4 z-40 grid h-16 w-16 place-items-center rounded-full active:scale-95`}
        >
          <img
            src="/assistant/mascot-96.png"
            alt=""
            aria-hidden
            className="assistant-bob h-14 w-14 object-contain drop-shadow-sm"
          />
        </button>
      )}
      <AssistantSheet open={open} onClose={() => setOpen(false)} role={role} userName={firstName} />
    </>
  )
}
