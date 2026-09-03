import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Check, Star, ChevronLeft, ChevronRight, 
  MessageSquare, Play, Globe, Shield, Smartphone, 
  Users, CreditCard, Award 
} from 'lucide-react';
import { useFirestoreCollection, useFirestoreDocument } from '../hooks/useFirestoreData';
import { limit, orderBy } from 'firebase/firestore';
import styles from './Landing.module.css';

// Types
interface Cours {
  id: string;
  titre: string;
  description: string;
  instructeurNom: string;
  categorie: string;
  prix: number;
  rating: number;
  nombreEleves: number;
  image: string;
}

interface Instructeur {
  id: string;
  nom: string;
  role: string;
  photo: string;
  rating: number;
  nombreCours: number;
  nombreEleves: number;
}

interface Temoignage {
  id: string;
  texte: string;
  auteurNom: string;
  auteurRole: string;
  rating: number;
  avatar: string;
}

interface StatData {
  totalApprenants: number;
  totalCours: number;
  totalInstructeurs: number;
  totalPays: number;
}

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Firestore Real-time Data
  const { data: coursData, loading: coursLoading } = useFirestoreCollection<Cours>(
    'cours', 
    [orderBy('rating', 'desc'), limit(4)]
  );
  
  const { data: instructeursData, loading: instructeursLoading } = useFirestoreCollection<Instructeur>(
    'instructeurs',
    [orderBy('rating', 'desc'), limit(3)]
  );
  
  const { data: temoignagesData, loading: temoignagesLoading } = useFirestoreCollection<Temoignage>(
    'temoignages',
    [orderBy('rating', 'desc'), limit(3)]
  );
  
  const { data: stats, loading: statsLoading } = useFirestoreDocument<StatData>('statistiques', 'global');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleScrollTo = (id: string) => {
    closeMenu();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('coursesCarousel');
    if (carousel) {
      carousel.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const LoadingSkeleton = () => (
    <div className={styles.loadingPulse} style={{ height: '200px', width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }} />
  );

  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className={styles.landingWrapper}>
      {/* Background animé */}
      <div className={styles.meshBg} aria-hidden="true">
        <div className={`${styles.meshOrb} ${styles.meshOrb1}`}></div>
        <div className={`${styles.meshOrb} ${styles.meshOrb2}`}></div>
      </div>
      <div className={styles.kentePattern} aria-hidden="true"></div>

      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          <button onClick={() => handleScrollTo('#')} className={styles.navLogo} aria-label="NDARA - Accueil">
            <img src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/129ac15f1-df23-4a15-bcd3-db2b6ca4e7e0.png" alt="" className={styles.navLogoImg} />
            <span className={styles.navLogoText}>NDARA</span>
          </button>
          
          <ul className={styles.navLinks}>
            <li><button onClick={() => handleScrollTo('features')} className={styles.navLink}>Fonctionnalités</button></li>
            <li><button onClick={() => handleScrollTo('courses')} className={styles.navLink}>Cours</button></li>
            <li><button onClick={() => handleScrollTo('instructors')} className={styles.navLink}>Instructeurs</button></li>
            <li><button onClick={() => handleScrollTo('pricing')} className={styles.navLink}>Tarifs</button></li>
            <li><button onClick={() => handleScrollTo('faq')} className={styles.navLink}>FAQ</button></li>
          </ul>
          
          <Link to="/register" className={styles.navCta}>S'inscrire</Link>
          <Link to="/login" className={`${styles.navCta} ${styles.btnSecondary}`} style={{ marginLeft: "10px", padding: "0.6rem 1.2rem", background: "rgba(255, 255, 255, 0.1)" }}>Connexion</Link>
          
          <button className={styles.navMenuBtn} onClick={toggleMenu} aria-label="Ouvrir le menu" aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`} role="dialog" aria-modal="true">
        <div className={styles.mobileMenuBackdrop} onClick={closeMenu}></div>
        <div className={styles.mobileMenuSheet}>
          <div className={styles.mobileMenuHandle}></div>
          <ul className={styles.mobileMenuLinks}>
            <li><button onClick={() => handleScrollTo('features')} className={styles.mobileMenuLink}>Fonctionnalités <ChevronRight size={20} color="var(--accent-gold)" /></button></li>
            <li><button onClick={() => handleScrollTo('courses')} className={styles.mobileMenuLink}>Cours populaires <ChevronRight size={20} color="var(--accent-gold)" /></button></li>
            <li><button onClick={() => handleScrollTo('instructors')} className={styles.mobileMenuLink}>Instructeurs <ChevronRight size={20} color="var(--accent-gold)" /></button></li>
            <li><button onClick={() => handleScrollTo('pricing')} className={styles.mobileMenuLink}>Tarifs <ChevronRight size={20} color="var(--accent-gold)" /></button></li>
            <li><button onClick={() => handleScrollTo('faq')} className={styles.mobileMenuLink}>FAQ <ChevronRight size={20} color="var(--accent-gold)" /></button></li>
          </ul>
          <Link to="/register" className={styles.mobileMenuCta}>Commencer gratuitement</Link>
          <Link to="/login" className={styles.mobileMenuCta} style={{ marginTop: "10px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>Se connecter</Link>
        </div>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className={styles.heroContent}>
            <motion.div variants={revealVariants} className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              <span>🌍 Plateforme #1 en Afrique</span>
            </motion.div>
            
            <motion.h1 variants={revealVariants} className={styles.heroTitle}>
              Apprenez.<br/>
              Enseignez.<br/>
              <span className={styles.highlight}>Prospérez.</span>
            </motion.h1>
            
            <motion.p variants={revealVariants} className={styles.heroSubtitle}>
              La première plateforme e-learning panafricaine qui connecte les meilleurs instructeurs aux apprenants ambitieux. Cours en ligne, certifications reconnues, communauté active.
            </motion.p>
            
            <motion.div variants={revealVariants} className={styles.heroCtas}>
              <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
                Commencer gratuitement
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <button onClick={() => handleScrollTo('courses')} className={`${styles.btn} ${styles.btnSecondary}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Explorer les cours
              </button>
            </motion.div>
            
            <motion.div variants={revealVariants} className={styles.heroStats}>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{statsLoading ? '...' : `${Math.floor((stats?.totalApprenants || 50000)/1000)}K+`}</div>
                <div className={styles.heroStatLabel}>Apprenants actifs</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{statsLoading ? '...' : `${Math.floor((stats?.totalCours || 1200)/1000)}.${Math.floor(((stats?.totalCours || 1200)%1000)/100)}K`}</div>
                <div className={styles.heroStatLabel}>Cours disponibles</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{statsLoading ? '...' : `${stats?.totalInstructeurs || 300}+`}</div>
                <div className={styles.heroStatLabel}>Instructeurs experts</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>98%</div>
                <div className={styles.heroStatLabel}>Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }} className={styles.heroImage}>
            <div className={styles.heroImageGlow}></div>
            <img src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/11cdbf9c8-7060-4e40-bc01-c13fa2a99ac9.png" alt="Femme africaine utilisant une tablette pour apprendre" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statsLoading ? '...' : `${Math.floor((stats?.totalApprenants || 50000)/1000)}K+`}</div>
            <div className={styles.statLabel}>Apprenants</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statsLoading ? '...' : `${stats?.totalCours || 1200}+`}</div>
            <div className={styles.statLabel}>Cours</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statsLoading ? '...' : `${stats?.totalInstructeurs || 300}+`}</div>
            <div className={styles.statLabel}>Instructeurs</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statsLoading ? '...' : `${stats?.totalPays || 25}`}</div>
            <div className={styles.statLabel}>Pays</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Pourquoi NDARA</span>
            <h2 className={styles.sectionTitle}>Une plateforme pensée pour l'Afrique</h2>
            <p className={styles.sectionSubtitle}>Des outils modernes, une identité africaine, une ambition mondiale.</p>
          </motion.div>
          
          <div className={styles.featuresGrid}>
            {[
              { icon: <Award />, title: 'Cours Premium', desc: 'Des cours créés par des experts africains, adaptés aux réalités locales et aux standards internationaux.' },
              { icon: <Smartphone />, title: 'Mobile-First', desc: 'Apprenez où que vous soyez. Notre application PWA fonctionne même hors-ligne, parfaite pour les connexions limitées.' },
              { icon: <Shield />, title: 'Certifications', desc: 'Obtenez des certifications reconnues par les employeurs et valorisez votre parcours professionnel.' },
              { icon: <Globe />, title: 'Communauté', desc: 'Rejoignez une communauté de 50 000+ apprenants et instructeurs passionnés à travers tout le continent.' },
              { icon: <CreditCard />, title: 'Paiements Mobile Money', desc: 'Payez avec Orange Money, MTN, Wave, M-Pesa et plus encore. Multi-devises supporté.' },
              { icon: <Users />, title: 'Programme Ambassadeur', desc: 'Gagnez des commissions en recommandant NDARA. Devenez ambassadeur et monétisez votre réseau.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } } }} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cours populaires */}
      <section className={styles.courses} id="courses">
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Tendances</span>
            <h2 className={styles.sectionTitle}>Cours populaires</h2>
            <p className={styles.sectionSubtitle}>Découvrez les cours les plus suivis par notre communauté.</p>
          </motion.div>
          
          <div className={styles.coursesCarousel} id="coursesCarousel">
            {coursLoading ? (
              Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} />)
            ) : coursData.length > 0 ? (
              coursData.map((cours) => (
                <article key={cours.id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <img src={cours.image} alt={cours.titre} loading="lazy" />
                    <span className={styles.courseCategory}>{cours.categorie}</span>
                  </div>
                  <div className={styles.courseBody}>
                    <h3 className={styles.courseTitle}>{cours.titre}</h3>
                    <p className={styles.courseInstructor}>Par {cours.instructeurNom}</p>
                    <div className={styles.courseMeta}>
                      <div className={styles.courseRating}>
                        <Star size={14} fill="currentColor" /> {cours.rating} ({cours.nombreEleves})
                      </div>
                      <div className={styles.coursePrice}>{cours.prix.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p>Aucun cours disponible.</p>
            )}
          </div>
          
          <div className={styles.coursesNav}>
            <button onClick={() => scrollCarousel('left')} aria-label="Cours précédent">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollCarousel('right')} aria-label="Cours suivant">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Instructeurs */}
      <section className={styles.instructors} id="instructors">
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Experts</span>
            <h2 className={styles.sectionTitle}>Apprenez des meilleurs</h2>
            <p className={styles.sectionSubtitle}>Nos instructeurs sont des professionnels reconnus dans leur domaine.</p>
          </motion.div>
          
          <div className={styles.instructorsGrid}>
            {instructeursLoading ? (
              Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} />)
            ) : instructeursData.length > 0 ? (
              instructeursData.map((inst, idx) => (
                <motion.div key={inst.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } } }} className={styles.instructorCard}>
                  <div className={styles.instructorAvatar}>
                    <img src={inst.photo} alt={inst.nom} />
                  </div>
                  <div className={styles.instructorInfo}>
                    <div className={styles.instructorName}>{inst.nom}</div>
                    <div className={styles.instructorRole}>{inst.role}</div>
                    <div className={styles.instructorStats}>
                      <span><Star size={12} fill="currentColor" /> {inst.rating}</span>
                      <span>{inst.nombreCours} cours</span>
                      <span>{Math.floor(inst.nombreEleves/1000)}k+ élèves</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p>Aucun instructeur disponible.</p>
            )}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Témoignages</span>
            <h2 className={styles.sectionTitle}>Ce que disent nos apprenants</h2>
            <p className={styles.sectionSubtitle}>Des milliers de vies transformées à travers le continent.</p>
          </motion.div>
          
          <div className={styles.testimonialsGrid}>
            {temoignagesLoading ? (
              Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} />)
            ) : temoignagesData.length > 0 ? (
              temoignagesData.map((tem, idx) => (
                <motion.div key={tem.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } } }} className={styles.testimonialCard}>
                  <p className={styles.testimonialText}>{tem.texte}</p>
                  <div className={styles.testimonialAuthor}>
                    {tem.avatar ? (
                      <div className={styles.testimonialAvatar} style={{ backgroundImage: `url(${tem.avatar})`, backgroundSize: 'cover' }}></div>
                    ) : (
                      <div className={styles.testimonialAvatar}>{tem.auteurNom.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                    )}
                    <div className={styles.testimonialAuthorInfo}>
                      <div className={styles.testimonialAuthorName}>{tem.auteurNom}</div>
                      <div className={styles.testimonialAuthorRole}>{tem.auteurRole}</div>
                      <div className={styles.testimonialRating}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.floor(tem.rating) ? 'var(--accent-gold)' : 'none'} color={i < Math.floor(tem.rating) ? 'var(--accent-gold)' : 'var(--border-subtle)'} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p>Aucun témoignage disponible.</p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Tarifs</span>
            <h2 className={styles.sectionTitle}>Choisissez votre plan</h2>
            <p className={styles.sectionSubtitle}>Des formules adaptées à tous les budgets africains.</p>
          </motion.div>
          
          <div className={styles.pricingGrid}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className={styles.pricingCard}>
              <div className={styles.pricingName}>Gratuit</div>
              <div className={styles.pricingDesc}>Pour découvrir la plateforme</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>0</span>
                <span className={styles.pricingCurrency}>FCFA</span>
                <span className={styles.pricingPeriod}>/mois</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li><Check size={18} color="var(--accent-green)" /> 5 cours gratuits</li>
                <li><Check size={18} color="var(--accent-green)" /> Accès communauté</li>
                <li><Check size={18} color="var(--accent-green)" /> Forums & discussions</li>
                <li><Check size={18} color="var(--accent-green)" /> Support email</li>
              </ul>
              <Link to="/register" className={`${styles.btn} ${styles.btnSecondary} ${styles.pricingCta}`}>Commencer</Link>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1 } } }} className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.pricingBadge}>⭐ Populaire</div>
              <div className={styles.pricingName}>Pro</div>
              <div className={styles.pricingDesc}>Pour les apprenants sérieux</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>4 900</span>
                <span className={styles.pricingCurrency}>FCFA</span>
                <span className={styles.pricingPeriod}>/mois</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li><Check size={18} color="var(--accent-green)" /> Cours illimités</li>
                <li><Check size={18} color="var(--accent-green)" /> Mode hors-ligne</li>
                <li><Check size={18} color="var(--accent-green)" /> Certifications incluses</li>
                <li><Check size={18} color="var(--accent-green)" /> Mentorat mensuel</li>
                <li><Check size={18} color="var(--accent-green)" /> Support prioritaire</li>
              </ul>
              <Link to="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.pricingCta}`}>Essayer 7 jours</Link>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2 } } }} className={styles.pricingCard}>
              <div className={styles.pricingName}>Business</div>
              <div className={styles.pricingDesc}>Pour les équipes & entreprises</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>14 900</span>
                <span className={styles.pricingCurrency}>FCFA</span>
                <span className={styles.pricingPeriod}>/mois</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li><Check size={18} color="var(--accent-green)" /> Tout le plan Pro</li>
                <li><Check size={18} color="var(--accent-green)" /> Jusqu'à 10 utilisateurs</li>
                <li><Check size={18} color="var(--accent-green)" /> Analytics avancés</li>
                <li><Check size={18} color="var(--accent-green)" /> API & intégrations</li>
                <li><Check size={18} color="var(--accent-green)" /> Account manager dédié</li>
              </ul>
              <Link to="/register" className={`${styles.btn} ${styles.btnSecondary} ${styles.pricingCta}`}>Nous contacter</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq} id="faq">
        <div className={styles.sectionInner}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>FAQ</span>
            <h2 className={styles.sectionTitle}>Questions fréquentes</h2>
            <p className={styles.sectionSubtitle}>Tout ce que vous devez savoir sur NDARA.</p>
          </motion.div>
          
          <div className={styles.faqList}>
            {[
              { q: 'Comment fonctionne le mode hors-ligne ?', a: 'Avec un abonnement Pro ou Business, vous pouvez télécharger vos cours pour les consulter sans connexion internet. Parfait pour les zones avec une connexion limitée. Les progrès se synchronisent automatiquement dès que vous êtes reconnecté.' },
              { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons Orange Money, MTN Mobile Money, Wave, M-Pesa, Moov Money, ainsi que les cartes bancaires Visa et Mastercard. Les paiements sont sécurisés et supportent plusieurs devises (FCFA, EUR, USD, etc.).' },
              { q: 'Comment devenir instructeur sur NDARA ?', a: 'C\'est simple ! Créez un compte, passez la vérification KYC, puis soumettez votre premier cours pour review. Notre équipe examine chaque cours pour garantir la qualité. Vous gagnez jusqu\'à 70% de royalties sur chaque vente.' },
              { q: 'Les certifications sont-elles reconnues ?', a: 'Oui ! Nos certifications sont reconnues par plus de 500 entreprises partenaires en Afrique et à l\'international. Elles sont vérifiables en ligne via un QR code unique et peuvent être partagées sur LinkedIn.' },
              { q: 'Comment fonctionne le programme ambassadeur ?', a: 'Partagez votre lien de parrainage unique et gagnez 20% de commission sur chaque abonnement payant. Les commissions sont versées directement sur votre wallet NDARA et peuvent être retirées à tout moment via Mobile Money.' }
            ].map((faq, idx) => (
              <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.open : ''}`}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(idx)} aria-expanded={openFaq === idx}>
                  <span>{faq.q}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === idx ? 'rotate(45deg)' : 'none' }}>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className={styles.faqAnswer} style={{ maxHeight: openFaq === idx ? '300px' : '0' }}>
                  <div className={styles.faqAnswerInner}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal} id="cta">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants} className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Prêt à transformer votre avenir ?</h2>
          <p className={styles.ctaSubtitle}>Rejoignez 50 000+ apprenants et commencez votre parcours dès aujourd'hui. 7 jours d'essai gratuit, sans engagement.</p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
              Commencer gratuitement
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link to="/register" className={`${styles.btn} ${styles.btnSecondary}`}>Parler à un conseiller</Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div>
              <div className={styles.footerBrand}>
                <img src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/129ac15f1-df23-4a15-bcd3-db2b6ca4e7e0.png" alt="" />
                <span className={styles.footerBrandName}>NDARA</span>
              </div>
              <p className={styles.footerTagline}>La première plateforme e-learning panafricaine. Apprenez, enseignez, prospérez.</p>
              <div className={styles.footerSocial}>
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
              </div>
            </div>
            
            <div>
              <div className={styles.footerColTitle}>Plateforme</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/catalog">Catalogue</Link></li>
                <li><button onClick={() => handleScrollTo("instructors")} className={styles.navLink}>Instructeurs</button></li>
                <li><button onClick={() => handleScrollTo("pricing")} className={styles.navLink}>Tarifs</button></li>
                <li><button onClick={() => handleScrollTo("pricing")} className={styles.navLink}>Entreprises</button></li>
              </ul>
            </div>
            
            <div>
              <div className={styles.footerColTitle}>Ressources</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/catalog">Blog</Link></li>
                <li><Link to="/legal">Centre d'aide</Link></li>
                <li><Link to="/register">Communauté</Link></li>
                <li><Link to="/catalog">Webinaires</Link></li>
              </ul>
            </div>
            
            <div>
              <div className={styles.footerColTitle}>Légal</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/legal">CGU</Link></li>
                <li><Link to="/legal">Confidentialité</Link></li>
                <li><Link to="/legal">Cookies</Link></li>
                <li><Link to="/legal">RGPD</Link></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div>© 2027 NDARA Afrique. Tous droits réservés.</div>
            <div className={styles.footerBottomLinks}>
              <Link to="#">🌍 Français</Link>
              <Link to="#">Made with ❤️ in Africa</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <button className={styles.fab} onClick={() => alert('💬 Chat en direct - Bientôt disponible !')} aria-label="Discuter avec nous">
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default Landing;
