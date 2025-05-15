import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';

const getSavedLanguage = () => {
  try {
    const persistedState = localStorage.getItem('persist:root');
    if (persistedState) {
      const parsedState = JSON.parse(persistedState);
      return parsedState.language ? parsedState.language.replace(/"/g, '') : 'en';
    }
  } catch (error) {
    console.error('Lỗi khi lấy ngôn ngữ từ localStorage:', error);
  }
  return 'en';
};

const savedLanguage = getSavedLanguage();
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

window.addEventListener('storage', () => {
  const newLanguage = getSavedLanguage();
  if (newLanguage !== i18n.language) {
    i18n.changeLanguage(newLanguage);
  }
});

export default i18n;