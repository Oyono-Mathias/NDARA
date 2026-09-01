import React from 'react';
import { Hero } from '../components/public/Hero';
import { FeaturesGrid } from '../components/public/FeaturesGrid';
import { MarketSection } from '../components/public/MarketSection';
import { PricingCard } from '../components/public/PricingCard';
import { TrustSection } from '../components/public/TrustSection';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <FeaturesGrid />
      <MarketSection />
      
      <div className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Tarification</h2>
          <p className="text-gray-500 mt-2">Choisissez l'offre qui vous correspond.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            title="Étudiant" 
            price="Gratuit" 
            features={['Accès au catalogue gratuit', 'Support de base', 'Wallet OmPay standard']} 
          />
          <PricingCard 
            title="Pro" 
            price="5 000" 
            isPopular 
            features={['Accès illimité', 'Support prioritaire', 'Zéro frais de transaction']} 
          />
          <PricingCard 
            title="Instructeur" 
            price="Sur mesure" 
            features={['Outils de création', 'Analytics avancés', 'Commissions premium']} 
          />
        </div>
      </div>

      <TrustSection />
    </div>
  );
};
