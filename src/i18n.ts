import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files would normally be loaded via http-backend, but for simplicity we can inline the basic ones or load from JSON.
// We'll create basic English and French translations.

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to NDARA",
      "courses": "Courses",
      "dashboard": "Dashboard",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "settings": "Settings",
      "nav.features": "Features",
      "nav.academy": "Academy",
      "nav.market": "Market",
      "nav.pricing": "Pricing",
      "nav.login": "Login",
      "hero.badge": "New — The Knowledge Exchange is live",
      "hero.title1": "Education that",
      "hero.title2": "generates income."
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue sur NDARA",
      "courses": "Cours",
      "dashboard": "Tableau de bord",
      "login": "Connexion",
      "register": "Inscription",
      "logout": "Déconnexion",
      "settings": "Paramètres",
      "nav.features": "Fonctionnalités",
      "nav.academy": "Académie",
      "nav.market": "Bourse",
      "nav.pricing": "Tarifs",
      "nav.login": "Connexion",
      "hero.badge": "Nouveau — La Bourse du Savoir est lancée",
      "hero.title1": "L'éducation qui",
      "hero.title2": "génère des revenus."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
