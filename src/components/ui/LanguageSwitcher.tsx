import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'ع' },
]

const GRADIENT = { background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)' }

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function selectLang(code: string) {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md ambient-depth pl-3 pr-2 py-2 text-on-surface hover:bg-surface-container-lowest transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-primary">language</span>
        <span className="text-xs font-bold tracking-wide">{current.short}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-40 rounded-2xl bg-surface-container-lowest ambient-depth overflow-hidden z-50">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLang(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                i18n.language === lang.code ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              style={i18n.language === lang.code ? GRADIENT : undefined}
            >
              <span>{lang.label}</span>
              {i18n.language === lang.code && (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
