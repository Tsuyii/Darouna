import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'

type Role = 'syndic' | 'resident' | 'gardien'

const ROLES: { id: Role; icon: string; descKey: string }[] = [
  { id: 'syndic',   icon: 'business_center', descKey: 'roleSelect.syndicDesc' },
  { id: 'resident', icon: 'home',            descKey: 'roleSelect.residentDesc' },
  { id: 'gardien',  icon: 'security',        descKey: 'roleSelect.gardienDesc' },
]

export default function RoleSelect() {
  const [selected, setSelected] = useState<Role>('resident')
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, role, isLoading, logout } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-primary-container/5 rounded-bl-full blur-[120px]" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/3 bg-tertiary-container/5 rounded-tr-full blur-[100px]" />

      {/* Header */}
      <header className="relative w-full flex justify-center pt-12 pb-8">
        {/* Language switcher — top right */}
        <div className="absolute top-6 end-6">
          <LanguageSwitcher />
        </div>
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/darouna-logo.png"
            alt="Darouna"
            className="h-20 w-20 rounded-[22%] shadow-[0_14px_34px_rgba(6,78,59,0.28)]"
          />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">

        {/* Already logged in banner */}
        {isAuthenticated && role && (
          <div className="w-full max-w-sm mb-10 bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_circle</span>
              <div>
                <p className="text-xs font-bold text-on-surface">{t('roleSelect.signedInAs', { role: t(`roles.${role}`) })}</p>
                <p className="text-[10px] text-on-surface-variant">{t('roleSelect.switchHint')}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => navigate(`/${role}`, { replace: true })}
                className="text-[10px] font-bold text-primary hover:underline whitespace-nowrap"
              >
                {t('roleSelect.goDashboard')}
              </button>
              <button
                onClick={() => logout()}
                className="text-[10px] font-bold text-error hover:underline"
              >
                {t('roleSelect.signOut')}
              </button>
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-background font-headline tracking-tight">
            {t('auth.welcome')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">
            {t('auth.selectRole')}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {ROLES.map((r) =>
            r.id === selected ? (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#064E3B] to-[#10B981] rounded-xl shadow-2xl shadow-emerald-900/20 transform scale-105 z-10 glass-glow overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 text-white">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {r.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-headline text-white">{t(`roles.${r.id}`)}</h3>
                <p className="text-sm text-white/80 mt-2 text-center">{t(r.descKey)}</p>
                <div className="mt-6 px-4 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white">
                    {t('roleSelect.currentSelection')}
                  </span>
                </div>
              </button>
            ) : (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className="group relative flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl ambient-depth border border-outline-variant/10 hover:border-primary-container/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined text-3xl">{r.icon}</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface">{t(`roles.${r.id}`)}</h3>
                <p className="text-sm text-on-surface-variant mt-2 text-center">{t(r.descKey)}</p>
              </button>
            )
          )}
        </div>

        {/* CTA */}
        <div className="mt-20 w-full max-w-sm">
          <button
            onClick={() => navigate(`/login/${selected}`)}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 glass-glow hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-3"
          >
            {t('auth.continueAs', { role: t(`roles.${selected}`) })}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <div className="flex items-center justify-center mt-8 gap-4">
            <div className="h-[1px] flex-grow bg-outline-variant/20" />
            <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant/50">
              {t('roleSelect.needHelp')}
            </span>
            <div className="h-[1px] flex-grow bg-outline-variant/20" />
          </div>
          <p className="text-center mt-6 text-sm font-medium text-on-surface-variant">
            {t('roleSelect.firstTime')}{' '}
            <button
              onClick={() => navigate(`/register/${selected}`)}
              className="text-primary font-bold hover:underline"
            >
              {t('roleSelect.createAccount')}
            </button>
          </p>
        </div>
      </main>

      <footer className="w-full py-10 px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40">
          © 2024 Darouna Digital Properties. Premium Living Refined.
        </p>
      </footer>
    </div>
  )
}
