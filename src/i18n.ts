/**
 * Système d'internationalisation (Base)
 * Langue principale : Français
 */

export type Language = 'fr' | 'en';

export const defaultLanguage: Language = 'fr';

export const translations = {
  fr: {
    app: {
      title: 'NDARA'
    }
  },
  en: {
    app: {
      title: 'NDARA'
    }
  }
};

export const getTranslation = (lang: Language = defaultLanguage) => {
  return translations[lang] || translations[defaultLanguage];
};
