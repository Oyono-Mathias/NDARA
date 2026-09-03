import React from 'react';
import { BookOpen, Store, Wallet, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    { 
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />, 
      title: 'Apprentissage', 
      desc: 'Accédez à des cours structurés de haute qualité avec suivi de progression et certifications reconnues.',
      bgColor: 'bg-indigo-50',
      delay: 0.1
    },
    { 
      icon: <Store className="w-6 h-6 text-emerald-600" />, 
      title: 'Marketplace', 
      desc: 'Acquérez et proposez des ressources numériques, livres, et matériels éducatifs dans un espace sécurisé.',
      bgColor: 'bg-emerald-50',
      delay: 0.2
    },
    { 
      icon: <Wallet className="w-6 h-6 text-blue-600" />, 
      title: 'OmPay Wallet', 
      desc: 'Gérez vos paiements, vos revenus formateurs et vos transferts avec notre portefeuille numérique intégré.',
      bgColor: 'bg-blue-50',
      delay: 0.3
    },
    { 
      icon: <Users className="w-6 h-6 text-amber-600" />, 
      title: 'Communauté', 
      desc: 'Échangez avec des formateurs et des étudiants du monde entier via nos forums et sessions de tutorat.',
      bgColor: 'bg-amber-50',
      delay: 0.4
    },
  ];

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50">
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Un écosystème complet
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          NDARA regroupe tous les outils essentiels pour apprendre, enseigner et monétiser vos connaissances de manière transparente.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: f.delay }}
            className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start text-left hover:shadow-md transition-shadow"
          >
            <div className={`mb-6 p-4 ${f.bgColor} rounded-xl inline-flex items-center justify-center`}>
              {f.icon}
            </div>
            <h3 className="font-semibold text-xl text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-600 leading-relaxed text-base">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
