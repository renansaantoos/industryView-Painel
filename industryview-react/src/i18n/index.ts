import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './pt.json';
import en from './en.json';
import es from './es.json';

const LOCALE_STORAGE_KEY = '__locale_key__';

/** Get stored locale or default to 'pt' */
function getStoredLocale(): string {
  return localStorage.getItem(LOCALE_STORAGE_KEY) || 'pt';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    lng: getStoredLocale(),
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

/** Change language and persist to localStorage */
export function changeLanguage(language: string) {
  i18n.changeLanguage(language);
  localStorage.setItem(LOCALE_STORAGE_KEY, language);
}

/** Get current language */
export function getCurrentLanguage(): string {
  return i18n.language || 'pt';
}

/** Available languages */
export const LANGUAGES = [
  { code: 'pt', label: 'Português', name: 'Portuguese', nativeName: 'Portugues', flag: '🇧🇷' },
  { code: 'en', label: 'English', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', name: 'Spanish', nativeName: 'Espanol', flag: '🇪🇸' },
];

export default i18n;
