import React from "react";

export function Footer() {
  return (
    <footer className="bg-dark-primary border-t border-dark-border pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald to-emerald-dark rounded flex items-center justify-center font-black text-white text-xs">
                N
              </div>
              <span className="font-bold tracking-tight text-white">NDARA</span>
            </div>
            <p className="text-text-muted leading-relaxed pe-4">
              La première plateforme africaine alliant éducation pratique et
              opportunités financières.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Plateforme</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Universal Playground
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  La Bourse du Savoir
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Tuteur IA Mathias
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Wallet XAF
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Légal & Sécurité</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Conditions Générales
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Architecture Zéro-Trust
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Communauté</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Discord Associatif
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Blog Technique
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-text-secondary hover:text-emerald transition-colors"
                >
                  Devenir Instructeur
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-dark-border flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-xs">
          <div>
            &copy; {new Date().getFullYear()} NDARA Universal Learning. Tous
            droits réservés.
          </div>
          <div className="flex items-center gap-2">
            Système opérationnel :{" "}
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-ring ml-1 block"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
