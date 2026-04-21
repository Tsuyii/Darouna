import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Role = 'syndic' | 'resident' | 'gardien'

const NAV_ITEMS: Record<Role, { to: string; icon: string; label: string }[]> = {
  syndic: [
    { to: '/syndic',            icon: 'dashboard',             label: 'Dash' },
    { to: '/syndic/units',      icon: 'domain',                label: 'Units' },
    { to: '/syndic/finance',    icon: 'payments',              label: 'Cash' },
    { to: '/syndic/contacts',   icon: 'forum',                 label: 'Contacts' },
  ],
  resident: [
    { to: '/resident',             icon: 'dashboard',              label: 'Home' },
    { to: '/resident/properties',  icon: 'domain',                 label: 'Properties' },
    { to: '/resident/ledger',      icon: 'account_balance_wallet', label: 'Ledger' },
    { to: '/resident/messages',    icon: 'chat',                   label: 'Messages' },
  ],
  gardien: [
    { to: '/gardien',             icon: 'home',                   label: 'Home' },
    { to: '/gardien/tasks',       icon: 'assignment',             label: 'Tasks' },
    { to: '/gardien/finance',     icon: 'account_balance_wallet', label: 'Finance' },
    { to: '/gardien/messages',    icon: 'chat',                   label: 'Messages' },
  ],
}

export default function BottomNav({ role }: { role: Role }) {
  const location = useLocation()
  const items = NAV_ITEMS[role]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-emerald-900/5 shadow-[0_-10px_30px_rgba(43,105,84,0.04)] px-4 pb-6 pt-3 flex justify-around items-center rounded-t-[32px]">
      {items.map((item) => {
        const isActive =
          item.to.split('/').length === 2
            ? location.pathname === item.to || location.pathname === item.to + '/'
            : location.pathname.startsWith(item.to)

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center justify-center transition-all duration-300',
              isActive
                ? 'bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white rounded-xl px-4 py-2 shadow-lg shadow-emerald-900/20'
                : 'text-emerald-900/50 px-4 py-2 hover:text-emerald-700'
            )}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-body font-bold text-[9px] uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
