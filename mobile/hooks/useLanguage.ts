import { useSettingsStore } from '../store/settingsStore';

export const useLanguage = () => {
  const { language, setLanguage } = useSettingsStore();

  const translations: Record<string, Record<string, string>> = {
    te: {
      hello: 'హలో',
      welcome: 'స్వాగతం',
      settings: 'సెట్టింగ్‌లు',
    },
    hi: {
      hello: 'नमस्ते',
      welcome: 'स्वागत है',
      settings: 'सेटिंग्स',
    },
    en: {
      hello: 'Hello',
      welcome: 'Welcome',
      settings: 'Settings',
    },
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return {
    language,
    setLanguage,
    t,
  };
};
