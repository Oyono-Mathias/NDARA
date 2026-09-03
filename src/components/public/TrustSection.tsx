import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const TrustSection: React.FC = () => {
  const items = [
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Transactions sécurisées',
      desc: 'Infrastructure de paiement chiffrée avec validation backend par Cloud Functions.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Protection des données',
      desc: 'Architecture conforme aux normes de sécurité avec accès strict contrôlé par Firestore.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Qualité du contenu',
      desc: 'Processus d\'audit et de vérification rigoureux pour chaque formateur et chaque cours.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    }
  ];

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Sécurité et Confiance</h2>
        <p className="text-lg text-slate-600">
          Nous avons bâti NDARA sur une architecture cloud moderne, garantissant la protection absolue de vos données et transactions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {items.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex flex-col items-center text-center group"
          >
            <div className={`p-5 rounded-2xl mb-6 transition-transform duration-300 group-hover:-translate-y-2 ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <h4 className="font-semibold text-xl text-slate-900 mb-3">{item.title}</h4>
            <p className="text-base text-slate-600 leading-relaxed max-w-xs">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
