import React from "react";
import { useNavigate } from "react-router-dom";

export function PricingCard({ price = 15000 }: { price?: number }) {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-widest mb-3">
            Tarification
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4">
            Un prix unique. Accès illimité.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Pas d'abonnement mensuel, pas de frais cachés. Le savoir appartient
            à l'Afrique.
          </p>
        </div>

        <div className="bg-dark-secondary border border-dark-border rounded-3xl p-1 lg:p-2 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-cyan/5 pointer-events-none"></div>
          <div className="bg-dark-primary rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative z-10 lg:flex items-center gap-8">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter">
                  {price.toLocaleString("fr-FR")}
                </span>
                <span className="text-emerald-light font-bold pb-2">XAF</span>
              </div>
              <div className="text-sm font-medium text-emerald bg-emerald-glow border border-emerald/20 inline-block px-3 py-1 rounded-full mb-6">
                Paiement unique (Lifetime)
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                  <svg
                    className="w-5 h-5 text-emerald flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Accès à vie aux Sandbox Pratiques
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                  <svg
                    className="w-5 h-5 text-emerald flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Wallet XAF pour vendre et acheter
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                  <svg
                    className="w-5 h-5 text-emerald flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Tuteur IA Mathias 24/7
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                  <svg
                    className="w-5 h-5 text-emerald flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Certifications vérifiables sur blockchain
                </li>
              </ul>
            </div>

            <div className="lg:w-1/2 p-6 sm:p-8 bg-dark-secondary rounded-2xl border border-dark-border">
              <h4 className="text-sm font-bold text-white mb-4">
                Paiements locaux acceptés :
              </h4>
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="px-3 py-2 bg-dark-primary border border-dark-border rounded-lg text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> OM
                </div>
                <div className="px-3 py-2 bg-dark-primary border border-dark-border rounded-lg text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>{" "}
                  MOMO
                </div>
                <div className="px-3 py-2 bg-dark-primary border border-dark-border rounded-lg text-xs font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>{" "}
                  VISA
                </div>
              </div>
              <button
                onClick={() => navigate("/auth")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald text-dark-primary font-bold rounded-xl transition-all hover:bg-emerald-light shadow-lg shadow-emerald/20 hover:-translate-y-0.5"
              >
                S'inscrire maintenant
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
