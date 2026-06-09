import React from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-radial-gradient from-emerald/8 via-transparent to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-cyan/5 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div
        className="absolute bottom-20 right-10 w-48 h-48 bg-emerald/5 rounded-full blur-2xl animate-float pointer-events-none"
        style={{ animationDelay: "-3s" }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-glow border border-emerald/20 rounded-full text-xs font-semibold text-emerald-light uppercase tracking-wider mb-8 animate-slide-up">
          <span className="w-2 h-2 bg-emerald rounded-full relative">
            <span className="absolute inset-0 rounded-full border border-emerald animate-pulse-ring"></span>
          </span>
          Nouveau — La Bourse du Savoir est lancée
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          L'éducation qui
          <br />
          <span className="bg-gradient-to-r from-emerald-light via-cyan to-emerald bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
            génère des revenus.
          </span>
        </h1>

        <p
          className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Rejoignez la première plateforme africaine qui transforme le savoir en
          actifs financiers. Apprenez, certifiez-vous, investissez et trouvez du
          travail — tout en un seul écosystème.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-16 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={() => navigate("/auth")}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald to-emerald-dark text-white font-bold text-base rounded-full transition-all shadow-lg shadow-emerald/30 hover:shadow-emerald/40 hover:-translate-y-0.5 relative overflow-hidden touch-target"
          >
            <span className="relative z-10">Commencer maintenant</span>
            <svg
              className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
          <a
            href="#market"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-dark-border text-text-secondary font-semibold text-base rounded-full hover:border-emerald hover:text-emerald-light hover:bg-emerald-glow transition-all touch-target"
          >
            Découvrir le Marché
            <svg
              className="w-4 h-4"
              flex-shrink-0="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </a>
        </div>

        <div
          className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-dark-border animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              15k+
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
              Étudiants actifs
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              120+
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
              Cours certifiants
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              450M
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
              FCFA échangés
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
