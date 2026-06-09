import React, { useState } from "react";
import { PreviewModal } from "./Preview/PreviewModal";

const templates = [
  {
    id: "portfolio-pro",
    title: "Portfolio Développeur Pro",
    desc: "Un template React/Tailwind complet pour présenter vos projets avec des animations fluides.",
    price: "5.000",
    tags: ["React", "Tailwind", "Motion"],
    author: "Alice D.",
    previewUrl: "https://demo.vercel.app/portfolio-pro", // Example URL
  },
  {
    id: "ecommerce-lite",
    title: "E-Commerce Lite",
    desc: "Boutique en ligne minimaliste avec panier et intégration de paiement simulée.",
    price: "8.500",
    tags: ["React", "Stripe", "Context"],
    author: "Bob M.",
    previewUrl: "https://demo.vercel.app/ecommerce-lite", // Example URL
  },
  {
    id: "dashboard-admin",
    title: "Dashboard Admin",
    desc: "Panneau de contrôle complet avec graphiques, tables de données et authentification.",
    price: "12.000",
    tags: ["React", "Recharts", "Auth"],
    author: "Charlie L.",
    previewUrl: "https://demo.vercel.app/dashboard-admin", // Example URL
  },
];

export function MarketSection({ featuredUrl }: { featuredUrl?: string }) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const displayTemplates = [...templates];
  if (featuredUrl && displayTemplates.length > 0) {
    displayTemplates[0].previewUrl = featuredUrl;
  }

  const selectedTemplate = displayTemplates.find((t) => t.id === previewId);

  return (
    <section
      id="market"
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-dark-primary border-t border-dark-border"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-cyan-glow border border-cyan/20 rounded-full text-xs font-semibold text-cyan uppercase tracking-wider mb-5">
              La Bourse du Savoir
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4">
              Vendez vos créations. Achetez du temps.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Un marché peer-to-peer où les étudiants de NDARA vendent leurs
              templates, e-books et outils métier. Payez directement via le
              Wallet XAF.
            </p>
          </div>
          <button className="flex-shrink-0 px-6 py-3 border border-dark-border text-white text-sm font-bold rounded-xl hover:border-cyan hover:text-cyan transition-colors group flex items-center gap-2">
            Explorer le marché
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTemplates.map((template) => (
            <article
              key={template.id}
              className="bg-dark-secondary border border-dark-border rounded-2xl overflow-hidden hover:border-cyan hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              <div className="h-48 bg-dark-primary border-b border-dark-border relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent"></div>
                <div className="relative text-cyan">
                  <svg
                    className="w-16 h-16 opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div className="absolute top-3 left-3 bg-dark-primary/80 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white border border-dark-border">
                  @{template.author}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-dark-primary border border-dark-border rounded text-[10px] font-bold text-text-muted uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {template.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-grow">
                  {template.desc}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-mono font-bold text-white">
                      {template.price}
                    </span>
                    <span className="text-xs font-bold text-cyan">XAF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewId(template.id)}
                      className="px-4 py-2 border border-dark-border rounded-lg text-sm font-semibold text-white hover:bg-dark-primary hover:border-cyan transition-colors"
                    >
                      Aperçu
                    </button>
                    <button className="px-4 py-2 bg-cyan/10 text-cyan border border-cyan/20 rounded-lg text-sm font-semibold hover:bg-cyan hover:text-dark-primary transition-colors flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <PreviewModal
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        title={selectedTemplate?.title || ""}
        previewUrl={selectedTemplate?.previewUrl || ""}
        description={selectedTemplate?.desc}
      />
    </section>
  );
}
