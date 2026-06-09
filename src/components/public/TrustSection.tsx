import React from "react";

export function TrustSection() {
  return (
    <section
      id="security"
      className="py-16 sm:py-20 relative overflow-hidden bg-dark-secondary/50 border-y border-dark-border"
    >
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full md:w-1/2">
            <span className="inline-block px-3 py-1 bg-emerald-glow border border-emerald/20 rounded-full text-xs font-semibold text-emerald-light uppercase tracking-wider mb-5">
              Sécurité Institutionnelle
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4">
              Protégé comme une banque. Rapide comme le web.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
              L'infrastructure de NDARA repose sur le modèle Zéro-Trust. Vos
              fonds et vos données d'apprentissage sont enfermés dans des
              coffres numériques inviolables.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-glow flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-emerald"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Chiffrement AES-256
                  </h4>
                  <p className="text-xs text-text-muted mt-1">
                    Sur l'ensemble des transactions XAF.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-glow flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-emerald"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Cloudflare R2 Storage
                  </h4>
                  <p className="text-xs text-text-muted mt-1">
                    Vos données sont répliquées et protégées contre les pannes.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald/10 to-transparent rounded-2xl blur-xl h-full w-full"></div>
            <div className="bg-dark-primary border border-dark-border rounded-2xl p-6 relative z-10 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-glow blur-3xl -mr-10 -mt-10 transition-transform duration-1000 group-hover:scale-150"></div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center text-emerald">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">
                      Statut Zéro-Trust
                    </div>
                    <div className="text-sm font-bold text-emerald-light">
                      Actif & Sécurisé
                    </div>
                  </div>
                </div>
                <div className="h-2 w-2 bg-emerald rounded-full animate-pulse-ring"></div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
                  <span className="text-text-muted">Dernier audit :</span>
                  <span className="text-white">Aujourd'hui, 08:30</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
                  <span className="text-text-muted">
                    Contrats intelligents :
                  </span>
                  <span className="text-emerald">Verrouillés</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-muted">Réseau :</span>
                  <span className="text-cyan">Edge Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
