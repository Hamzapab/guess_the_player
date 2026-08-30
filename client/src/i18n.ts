import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/ar/translation.json';
import frTranslation from './locales/fr/translation.json';


i18n
  .use(LanguageDetector) // Auto-detects user's language
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // Default language if detection fails
    interpolation: {
      escapeValue: false, // protects from XSS
    },
   resources: {
    en: { translation: enTranslation },
    ar: { translation: esTranslation },
    fr: { translation: frTranslation }
  }
  });

export default i18n;