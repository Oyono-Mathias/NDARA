import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Globe2, ShieldCheck, Zap } from "lucide-react";

export function Landing() {
  return (
    <>
      {/* Hero */}
      <main className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-gray-300 mb-8 mt-12 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                Ndara 2.5 is now live
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-sans leading-[1.1] tracking-tighter mb-8 max-w-4xl">
                 L'Académie du <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400">Succès</span> en Afrique.
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl font-mono max-w-2xl mb-12">
                Maîtrisez les compétences de demain, certifié par l'intelligence artificielle MATHIAS, propulsé par la Finance Mobile Africaine.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/auth" className="bg-[#10B981] text-black px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#10B981]/80 transition flex items-center justify-center gap-3 group">
                    <span>Rejoindre l'Académie</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/instructor" className="bg-white/5 text-white border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition flex items-center justify-center">
                    Espace Expert
                </Link>
            </div>
        </div>
      </main>

      {/* Les 4 Piliers */}
      <section className="border-y border-white/5 bg-[#050505] py-24">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl lg:text-5xl font-black font-sans tracking-tight mb-4 text-white">Quatre Piliers <span className="text-[#10B981]">Fondamentaux</span></h2>
                  <p className="text-gray-400 font-mono max-w-2xl mx-auto">L'infrastructure Ndara Afrique transforme le savoir en un actif financier sécurisé tout en offrant un accompagnement par IA inédit sur le continent.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pilier 1 : Expérience Étudiant */}
                  <div className="bg-black border border-white/10 p-8 rounded-3xl group">
                     <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-[#10B981] border border-green-500/20 mb-6 group-hover:scale-110 transition-transform">
                         <GraduationCap className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold font-serif mb-4">L'Expérience Étudiant</h3>
                     <ul className="space-y-3 text-gray-400 font-mono text-sm leading-relaxed">
                         <li><strong className="text-white">Android-First :</strong> Interface optimisée pour smartphone, apprentissage fluide même avec une faible connexion.</li>
                         <li><strong className="text-white">Tuteur MATHIAS IA :</strong> Assistant intelligent dispo 24/7 (Gemini 1.5) qui répond précisément sur le contenu.</li>
                         <li><strong className="text-white">Succès Certifié :</strong> Certificat HD infalsifiable généré en fin de parcours avec code QR pour recruteurs.</li>
                     </ul>
                  </div>

                  {/* Pilier 2 : Excellence Formateur */}
                  <div className="bg-black border border-white/10 p-8 rounded-3xl group">
                     <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mb-6 group-hover:scale-110 transition-transform">
                         <Zap className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold font-serif mb-4">L'Excellence Formateur</h3>
                     <ul className="space-y-3 text-gray-400 font-mono text-sm leading-relaxed">
                         <li><strong className="text-white">Création Assistée :</strong> Le copilote Mathias structure les modules, rédige le marketing et génère les quiz.</li>
                         <li><strong className="text-white">Audit Qualité :</strong> Score minimal IA de 80/100 exigé pour publication, garantissant le standard Ndara.</li>
                         <li><strong className="text-white">Monétisation Élite :</strong> L'expert conserve 70% des revenus. Le savoir devient un actif financier.</li>
                     </ul>
                  </div>

                  {/* Pilier 3 : Bourse du Savoir */}
                  <div className="bg-black border border-white/10 p-8 rounded-3xl group">
                     <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                         <Globe2 className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold font-serif mb-4">La Bourse du Savoir</h3>
                     <ul className="space-y-3 text-gray-400 font-mono text-sm leading-relaxed">
                         <li><strong className="text-white">Marché Secondaire :</strong> Innovation majeure permettant aux experts de céder leur "Licence de revente".</li>
                         <li><strong className="text-white">Rente Passive :</strong> L'investisseur achète la licence et encaisse les futures ventes à la place du créateur.</li>
                         <li><strong className="text-white">Liquidité :</strong> Transformez votre propriété intellectuelle en capital immédiat pour d'autres projets.</li>
                     </ul>
                  </div>

                  {/* Pilier 4 : Infrastructure Financière */}
                  <div className="bg-black border border-white/10 p-8 rounded-3xl group">
                     <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-6 group-hover:scale-110 transition-transform">
                         <ShieldCheck className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold font-serif mb-4">Infrastructure Financière</h3>
                     <ul className="space-y-3 text-gray-400 font-mono text-sm leading-relaxed">
                         <li><strong className="text-white">Balance :</strong> Fonds immédiats pour l'achat de nouvelles formations in-app.</li>
                         <li><strong className="text-white">Affiliate Balance :</strong> Gains (ventes et parrainages) retirables vers Orange Money, MTN ou Wave.</li>
                         <li><strong className="text-white">Pending Balance :</strong> Séquestre de sécurité (14 jours) anti-fraude avant la libération des fonds.</li>
                     </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* Economie du Savoir */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-black font-sans tracking-tight mb-4 text-white">L'Économie du <span className="text-[#10B981]">Savoir</span></h2>
                <p className="text-gray-400 font-mono max-w-2xl mx-auto">Transformez votre engagement en revenus réels payés directement sur votre mobile. Trois leviers puissants pour générer de la richesse sur Ndara Afrique.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#10B981]/50 transition group">
                   <div className="text-[#10B981] font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> 1. CRÉATION</div>
                   <h3 className="text-2xl font-bold mb-4 font-serif text-white group-hover:text-[#10B981] transition">L'Expert (70%)</h3>
                   <ul className="space-y-4 text-gray-400 font-mono text-sm">
                       <li><strong className="text-gray-300">Revenu :</strong> Perçoit 70% du prix de chaque vente de formation.</li>
                       <li><strong className="text-gray-300">Paiement :</strong> Crédit instantané sur la balance dès la validation (Orange Money, MTN, Wave).</li>
                       <li><strong className="text-gray-300">Gestion :</strong> Pilote son catalogue comme un portefeuille d'actifs financiers.</li>
                   </ul>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-teal-500/50 transition group">
                   <div className="text-teal-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-400"></span> 2. PARRAINAGE</div>
                   <h3 className="text-2xl font-bold mb-4 font-serif text-white group-hover:text-teal-400 transition">L'Ambassadeur (10%)</h3>
                    <ul className="space-y-4 text-gray-400 font-mono text-sm">
                       <li><strong className="text-gray-300">Mécanique :</strong> Vous générez des achats via votre lien unique.</li>
                       <li><strong className="text-gray-300">Commission :</strong> Gain de 10% sur les filleuls à vie.</li>
                       <li><strong className="text-gray-300">Sécurité :</strong> Séquestre anti-fraude de 14 jours avant libération sur solde retirable.</li>
                   </ul>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition group">
                   <div className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"></span> 3. BOURSE</div>
                   <h3 className="text-2xl font-bold mb-4 font-serif text-white group-hover:text-blue-400 transition">L'Investisseur (Rente)</h3>
                    <ul className="space-y-4 text-gray-400 font-mono text-sm">
                       <li><strong className="text-gray-300">Principe :</strong> Acquisition d'une Licence de Revente.</li>
                       <li><strong className="text-gray-300">Rente Passive :</strong> Vous encaissez les revenus des futures ventes à la place du créateur.</li>
                       <li><strong className="text-gray-300">Spéculation :</strong> Hausse de la valeur des licences sur le marché secondaire.</li>
                   </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Access links for simulation */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-serif mb-12">Simuler l'infrastructure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto font-mono">
            <Link to="/auth" className="p-8 border border-white/10 bg-[#050505] hover:border-[#10B981]/50 transition group">
                <GraduationCap className="w-8 h-8 text-gray-500 group-hover:text-[#10B981] mb-6 mx-auto transition" />
                <h4 className="text-xl font-bold mb-2">01. Étudiant</h4>
                <p className="text-xs text-gray-500">Expérience d'apprentissage et certification.</p>
            </Link>
             <Link to="/auth" className="p-8 border border-white/10 bg-[#050505] hover:border-amber-500/50 transition group">
                <Zap className="w-8 h-8 text-gray-500 group-hover:text-amber-500 mb-6 mx-auto transition" />
                <h4 className="text-xl font-bold mb-2">02. Expert</h4>
                <p className="text-xs text-gray-500">Création et Wealth Management.</p>
            </Link>
             <Link to="/auth" className="p-8 border border-white/10 bg-[#050505] hover:border-red-500/50 transition group">
                <ShieldCheck className="w-8 h-8 text-gray-500 group-hover:text-red-500 mb-6 mx-auto transition" />
                <h4 className="text-xl font-bold mb-2">03. Cockpit CEO</h4>
                <p className="text-xs text-gray-500">Supervision globale et souveraineté.</p>
            </Link>
        </div>
      </section>
      
      <footer className="border-t border-white/5 py-12 text-center text-xs font-mono text-gray-600 font-bold uppercase tracking-widest">
            Bara ala, Tonga na ndara • NDARA AFRIQUE 2.5
      </footer>
    </>
  );
}
