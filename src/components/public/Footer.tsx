import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex shrink-0 items-center min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group inline-flex -ml-2 p-2">
              <span className="font-black text-2xl tracking-tighter text-blue-600 group-hover:text-blue-700 transition-colors">NDARA</span>
              <span className="font-bold text-2xl tracking-tighter text-slate-900 ml-1">AFRIQUE</span>
            </Link>
            <p className="mt-4 text-slate-500 text-base leading-relaxed">
              La plateforme d'apprentissage en ligne de référence dédiée à l'Afrique. 
              Enseignez, apprenez et prospérez.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase">Navigation</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/courses" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  Formations
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase">Légal</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/privacy" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase">Contact</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a href="mailto:contact@ndara-afrique.com" className="inline-flex min-h-[44px] items-center text-base text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
                  contact@ndara-afrique.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-base text-slate-500 text-center">
            &copy; {currentYear} NDARA Afrique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
