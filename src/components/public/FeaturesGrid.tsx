import React from 'react';
import { BookOpen, Store, Wallet, Users } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    { icon: <BookOpen className="w-8 h-8 text-blue-600" />, title: 'Apprentissage', desc: 'Des cours de haute qualité.' },
    { icon: <Store className="w-8 h-8 text-purple-600" />, title: 'Marketplace', desc: 'Achetez et vendez vos créations.' },
    { icon: <Wallet className="w-8 h-8 text-green-600" />, title: 'OmPay Wallet', desc: 'Gestion sécurisée de vos fonds.' },
    { icon: <Users className="w-8 h-8 text-orange-600" />, title: 'Communauté', desc: 'Rejoignez des milliers de membres.' },
  ];

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900">Tout ce dont vous avez besoin</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-gray-50 rounded-full">{f.icon}</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
