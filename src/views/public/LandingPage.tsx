import React, { Suspense } from "react";
import { Navbar } from "../../components/public/Navbar";
import { Hero } from "../../components/public/Hero";
import { Footer } from "../../components/public/Footer";
import { useLandingSettings } from "../../hooks/useLandingSettings";

// Lazy loaded non-critical view components for optimal Edge performance
const FeaturesGrid = React.lazy(() =>
  import("../../components/public/FeaturesGrid").then((m) => ({
    default: m.FeaturesGrid,
  })),
);
const TrustSection = React.lazy(() =>
  import("../../components/public/TrustSection").then((m) => ({
    default: m.TrustSection,
  })),
);
const PricingCard = React.lazy(() =>
  import("../../components/public/PricingCard").then((m) => ({
    default: m.PricingCard,
  })),
);
const MarketSection = React.lazy(() =>
  import("../../components/public/MarketSection").then((m) => ({
    default: m.MarketSection,
  })),
);

export function LandingPage() {
  const { settings, loading } = useLandingSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald/20 border-t-emerald animate-spin"></div>
      </div>
    );
  }

  if (settings.kill_switch_active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-primary text-text-primary px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4 text-center">
          Maintenance en cours
        </h1>
        <p className="text-text-secondary max-w-md text-center">
          Nous mettons à jour notre infrastructure pour mieux vous servir.
          Revenez d'ici quelques minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary font-sans selection:bg-emerald-500/30 selection:text-emerald-200 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full flex flex-col overflow-x-hidden">
        {/* LCP element loaded synchronously */}
        <Hero />

        {/* Deferred elements loaded dynamically below the fold */}
        <Suspense
          fallback={
            <div className="h-64 w-full flex items-center justify-center text-emerald-500/50">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin"></div>
            </div>
          }
        >
          <FeaturesGrid />
          <TrustSection />
          <MarketSection featuredUrl={settings.featured_preview_url} />
          <PricingCard price={settings.monthly_price} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
