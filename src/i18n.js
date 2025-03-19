import i18n from 'i18next';
 import { initReactI18next } from 'react-i18next';
 import en from '@/locales/en.json';
 import vi from '@/locales/vi.json';
 
 const savedLanguage = localStorage.getItem('persist:root')
   ? JSON.parse(localStorage.getItem('persist:root')).language?.replace(/"/g, '') || 'vi'
   : 'vi';
 
 savedLanguage;
 
 i18n.use(initReactI18next).init({
   resources: {
     en: { translation: en },
     vi: { translation: vi },
   },
   lng: savedLanguage,
   fallbackLng: 'vi',
   interpolation: {
     escapeValue: false,
   },
 });
 
 export default i18n;