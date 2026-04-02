import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function TopAppBar() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'U'

  function handleAvatarClick() {
    if (role) navigate(`/${role}`, { replace: false })
  }

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FAF9F6]/80 backdrop-blur-xl flex justify-between items-center px-6 h-20 shadow-[0_20px_40px_rgba(43,105,84,0.06)]">
      <div className="flex items-center gap-3">
        <button
          onClick={handleAvatarClick}
          className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline font-black text-sm select-none active:scale-90 transition-transform"
          title="Go to dashboard"
        >
          {initials}
        </button>
        <div className="flex flex-col">
          <span className="font-headline font-black text-[#064E3B] tracking-tight text-lg leading-tight">
            {user?.name ?? 'Welcome'}
          </span>
          <span className="font-body text-[10px] text-[#064E3B]/70 font-semibold uppercase tracking-wider">
            Darouna S.G.I.R.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 bg-surface-container rounded-full text-[#064E3B] hover:opacity-80 transition-opacity active:scale-90 transition-transform"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          onClick={handleLogout}
          className="p-2 bg-surface-container rounded-full text-[#064E3B] hover:opacity-80 transition-opacity active:scale-90 transition-transform"
          aria-label="Sign out"
          title="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  )
}
