import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import fr from './fr.json'
import ar from './ar.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    detection: {
      order: ['querystring', 'localStorage'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

// Keep <html lang> and text direction (RTL for Arabic) in sync with the language.
function applyDocumentDir(lng: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
}

i18n.on('languageChanged', applyDocumentDir)
applyDocumentDir(i18n.resolvedLanguage ?? 'fr')

export default i18n
