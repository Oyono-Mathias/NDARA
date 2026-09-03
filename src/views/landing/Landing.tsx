import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, Search, ArrowRight, PlayCircle,
  TrendingUp, Shield, Smartphone, Star, Users, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirestoreQuery } from '../../hooks/data';
import { useCatalogClient } from '../../hooks/catalog/useCatalogClient';

import { where } from 'firebase/firestore';

export const Landing: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Firestore Data
  const { data: instructorList } = useFirestoreQuery<{ id: string, role: string, displayName?: string, avatarUrl?: string, title?: string, studentsCount?: number, rating?: number }>(
    'users', 
    [where('role', '==', 'instructor')]
  );
  
  const totalStudents = 15000; // Mocked for now until we have an aggregate stats document

  const { courses, loading: coursesLoading } = useCatalogClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Catalogue', path: '/catalog' },
    { name: 'Instructeurs', path: '/instructors' },
    { name: 'Tarifs', path: '/pricing' }
  ];

  const faqs = [
    { q: 'Comment fonctionne le mode hors-ligne ?', a: 'Une fois inscrit à un cours, vous pouvez le télécharger via notre application Android pour le suivre plus tard sans connexion internet.' },
    { q: 'Quels sont les moyens de paiement acceptés ?', a: 'Nous acceptons les principaux fournisseurs de Mobile Money, les cartes bancaires, ainsi que notre portefeuille intégré OmPay.' },
    { q: 'Les certificats sont-ils reconnus ?', a: 'Oui, nos certificats de complétion sont générés avec un identifiant unique vérifiable en ligne et reconnus par de nombreuses entreprises.' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              N
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
              NDARA
            </span>
          </Link>
          
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path} className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full rounded-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="hidden md:flex">
            <Link to="/login" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold text-sm hover:shadow-lg hover:shadow-yellow-500/25 transition-all hover:-translate-y-0.5">
              Commencer gratuitement
            </Link>
          </div>
          
          <button className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-x-0 bottom-0 z-[101] bg-[#1a1a2e] rounded-t-3xl p-6 border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8"></div>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 font-medium active:scale-95 transition-transform">
                    {link.name} <ArrowRight className="w-5 h-5 text-yellow-400" />
                  </Link>
                ))}
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-center active:scale-95 transition-transform">
                  Commencer gratuitement
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex items-center">
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-yellow-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Plateforme N°1 en Afrique
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              L'éducation <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 relative">
                sans frontières
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-30 rounded-full"></div>
              </span> <br />
              pour l'Afrique.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
              Ndara transforme l'apprentissage en Afrique. Des cours de qualité, 
              accessibles hors-ligne, payables par mobile money. Prenez en main votre avenir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <Link to="/catalog" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
                Explorer les cours <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/instructor/onboarding" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors">
                Devenir instructeur <PlayCircle className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8 w-full border-t border-white/10 mt-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-cyan-400">Communauté</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">d'Apprenants</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-cyan-400">{courses?.length || 0}+</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Cours</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-cyan-400">{instructorList.length}+</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Experts</div>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-[4/5] md:aspect-square w-full max-w-md mx-auto md:max-w-none rounded-3xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent mix-blend-overlay z-10"></div>
            <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80" alt="Étudiant sur mobile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-[#16213e]/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Pourquoi Ndara ?</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Conçu pour la réalité africaine.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">L'apprentissage pensé pour surmonter les défis de connectivité, de paiement et de pertinence locale.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-yellow-400/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-cyan-400/20 flex items-center justify-center mb-6 border border-yellow-400/30 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mobile-First & Hors Ligne</h3>
              <p className="text-slate-400 leading-relaxed">Téléchargez vos cours et progressez n'importe où, même sans connexion internet stable.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-yellow-400/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400/20 to-purple-400/20 flex items-center justify-center mb-6 border border-orange-400/30 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Paiements Locaux</h3>
              <p className="text-slate-400 leading-relaxed">Payez facilement par Mobile Money, cartes locales ou via notre portefeuille sécurisé OmPay.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-yellow-400/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-cyan-400/20 flex items-center justify-center mb-6 border border-green-400/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Certifications Valorisées</h3>
              <p className="text-slate-400 leading-relaxed">Obtenez des certificats reconnus par les employeurs pour booster votre carrière sur le continent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Preview */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Catalogue</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Apprenez des meilleurs.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Des compétences pratiques enseignées par des experts du terrain.</p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {coursesLoading ? (
            <p className="text-slate-400 text-center w-full">Chargement des cours...</p>
          ) : courses && courses.length > 0 ? (
            courses.slice(0, 5).map(course => (
              <Link to={`/catalog/${course.id}`} key={course.id} className="snap-start flex-none w-[85vw] sm:w-[320px] rounded-3xl bg-[#16213e]/80 border border-white/10 overflow-hidden hover:-translate-y-2 hover:border-yellow-400/50 transition-all group flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-yellow-400 border border-yellow-400/30">
                    {course.category || 'Général'}
                  </div>
                  <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">Par l'instructeur {course.instructorId.substring(0,6)}</p>
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /> 4.8 <span className="text-slate-500 font-normal">(120)</span>
                    </div>
                    <div className="font-bold text-lg text-white">
                      {course.price ? `${course.price} XAF` : 'Gratuit'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <p className="text-slate-400 text-center w-full">Aucun cours publié pour le moment.</p>
          )}
          
          <Link to="/catalog" className="snap-start flex-none w-[85vw] sm:w-[320px] rounded-3xl bg-[#1a1a2e] border border-dashed border-white/20 flex items-center justify-center hover:bg-[#16213e] transition-colors group">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/20 transition-colors">
                <ArrowRight className="w-8 h-8 text-yellow-400" />
              </div>
              <span className="font-bold text-lg">Voir tout le catalogue</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Instructors Preview */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#16213e]/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Nos Experts</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Des mentors qui vous comprennent.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructorList.length > 0 ? instructorList.slice(0,3).map((inst) => (
              <div key={inst.id} className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/50 flex-shrink-0 bg-slate-800 flex items-center justify-center text-xl font-bold">
                  {inst.avatarUrl ? <img src={inst.avatarUrl} alt={inst.displayName} className="w-full h-full object-cover" /> : (inst.displayName || 'I')[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{inst.displayName || 'Instructeur Anonyme'}</h3>
                  <p className="text-xs text-slate-400 mb-2">{inst.title || 'Expert Formateur'}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-yellow-400" /> {inst.studentsCount || 0}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {inst.rating || 5.0}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-center col-span-full">Aucun instructeur trouvé.</p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Support</span>
          <h2 className="text-3xl font-bold mt-2">Questions Fréquentes.</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-2xl border ${activeFaq === i ? 'bg-white/10 border-yellow-400/50' : 'bg-white/5 border-white/10'} overflow-hidden transition-all duration-300`}>
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-bold">
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-yellow-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 opacity-100 pb-5 px-5' : 'max-h-0 opacity-0 px-5'}`}>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 md:p-16 text-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,215,0,0.15)_0%,_transparent_70%)]"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Prêt à développer vos compétences ?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">Rejoignez des milliers d'apprenants africains. L'inscription prend moins de 2 minutes.</p>
          <Link to="/login" className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:-translate-y-1 relative z-10">
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#07070a] pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">N</div>
                <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-cyan-400">NDARA</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">La plateforme éducative conçue pour libérer le potentiel de l'Afrique.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Apprendre</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/catalog" className="hover:text-yellow-400 transition-colors">Catalogue</Link></li>
                <li><Link to="/certificates" className="hover:text-yellow-400 transition-colors">Certifications</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Enseigner</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/instructor/onboarding" className="hover:text-yellow-400 transition-colors">Devenir Instructeur</Link></li>
                <li><Link to="/partner" className="hover:text-yellow-400 transition-colors">Devenir Partenaire</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/faq" className="hover:text-yellow-400 transition-colors">Centre d'aide</Link></li>
                <li><Link to="/contact" className="hover:text-yellow-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div>&copy; {new Date().getFullYear()} Ndara Afrique. Tous droits réservés.</div>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-slate-300">Confidentialité</Link>
              <Link to="/legal" className="hover:text-slate-300">Mentions légales</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <Link to="/catalog" className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 hover:scale-110 active:scale-95 transition-transform z-50">
        <Search className="w-6 h-6" />
      </Link>
      
    </div>
  );
};
