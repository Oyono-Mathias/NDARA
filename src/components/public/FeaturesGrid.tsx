import React from "react";

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-widest mb-3">
            Un écosystème complet
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Trois piliers, une vision
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mt-3">
            NDARA n'est pas juste une école. C'est un écosystème financier et
            professionnel conçu pour l'avenir de l'Afrique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pillar 1 */}
          <article className="group bg-dark-secondary border border-dark-border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-cyan hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-14 rounded-xl bg-cyan-glow border border-cyan/20 flex items-center justify-center text-2xl mb-5">
              🎮
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-white">
              Universal Playground
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Laboratoires de pratique interactifs pour chaque compétence.
              Coder, trader, comptabiliser — tout dans une interface
              mobile-first immersive.
            </p>
            <span className="inline-block mt-5 px-3 py-1 bg-cyan-glow border border-cyan/20 rounded-full text-xs font-semibold text-cyan">
              12+ Sandbox disponibles
            </span>
          </article>

          {/* Pillar 2 */}
          <article className="group bg-dark-secondary border border-dark-border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-emerald hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-14 rounded-xl bg-emerald-glow border border-emerald/20 flex items-center justify-center text-2xl mb-5">
              💰
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-white">
              Wallet XAF Intégré
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Payez, recevez et investissez directement depuis l'app. Orange
              Money, MoMo et virements bancaires — tout est centralisé.
            </p>
            <span className="inline-block mt-5 px-3 py-1 bg-emerald-glow border border-emerald/20 rounded-full text-xs font-semibold text-emerald-light">
              Transactions sécurisées
            </span>
          </article>

          {/* Pillar 3 */}
          <article className="group bg-dark-secondary border border-dark-border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-cyan hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-14 rounded-xl bg-cyan-glow border border-cyan/20 flex items-center justify-center text-2xl mb-5">
              🤖
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-white">
              Mentorat IA Mathias
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Votre tuteur personnel disponible 24/7. Posez des questions,
              obtenez des corrections détaillées et progressez à votre rythme.
            </p>
            <span className="inline-block mt-5 px-3 py-1 bg-cyan-glow border border-cyan/20 rounded-full text-xs font-semibold text-cyan">
              Propulsé par Gemini
            </span>
          </article>
        </div>
      </div>
    </section>
  );
}
