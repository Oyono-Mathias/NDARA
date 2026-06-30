"use client";

import { motion } from "motion/react";
import { BookOpen, Trophy, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Catalogue Premium",
    description: "Accédez à des centaines de cours spécialisés créés par les meilleurs experts de leur domaine."
  },
  {
    icon: Trophy,
    title: "Apprentissage Validé",
    description: "Gagnez des certificats reconnus, bloqués sur la blockchain pour la sécurité."
  },
  {
    icon: Users,
    title: "Communauté Active",
    description: "Rejoignez une cohorte d'apprenants et collaborez via nos salons dédiés."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#10B981]/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-6 border border-[#10B981]/20 group-hover:scale-110 transition-transform emerald-glow">
                <feature.icon className="w-7 h-7 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
