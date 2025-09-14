import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ar: {
    translation: {
      appName: 'High Tracker',
      home: 'الصفحة الرئيسية',
      search: 'بحث',
      settings: 'الإعدادات',
      dashboard: 'لوحة التقدّم',
      subjects: 'المواد',
      studyMode: 'وضع الدراسة',
      language: 'اللغة',
    },
  },
  en: {
    translation: {
      appName: 'High Tracker',
      home: 'Home',
      search: 'Search',
      settings: 'Settings',
      dashboard: 'Progress Dashboard',
      subjects: 'Subjects',
      studyMode: 'Study Mode',
      language: 'Language',
    },
  },
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'ar',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
}

export default i18n
