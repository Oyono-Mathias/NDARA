import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../providers/AppProvider';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { classNames } from '../../lib/utils';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const publicLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Formations', path: '/courses' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'À propos', path: '/about' },
  ];

  return (
    <>
      <nav 
        className={classNames(
          "sticky top-0 z-50 safe-area-top transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/80 backdrop-blur-md border-slate-200 shadow-sm" 
            : "bg-white border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px]">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center">
              <Link to="/" className="flex shrink-0 items-center min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group" onClick={closeMobileMenu}>
                <span className="font-black text-2xl tracking-tighter text-blue-600 group-hover:text-blue-700 transition-colors">NDARA</span>
                <span className="font-bold text-2xl tracking-tighter text-slate-900 ml-1">AFRIQUE</span>
              </Link>
              
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      classNames(
                        "inline-flex items-center px-4 min-h-[48px] rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-slate-200 mx-2" aria-hidden="true" />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link to="/dashboard">
                    <Button variant="ghost" className="min-h-[48px] font-semibold text-slate-600 hover:text-slate-900">Tableau de bord</Button>
                  </Link>
                  <Button variant="outline" className="min-h-[48px] font-semibold border-slate-200" onClick={signOut}>Déconnexion</Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="focus:outline-none rounded-lg">
                    <Button variant="ghost" className="min-h-[48px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100">Connexion</Button>
                  </Link>
                  <Link to="/register" className="focus:outline-none rounded-lg">
                    <Button className="min-h-[48px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/10">S'inscrire</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center justify-end lg:hidden flex-1 space-x-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center w-[48px] h-[48px] rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 active:scale-95 transition-all"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label="Ouvrir le menu principal"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop & Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            
            <motion.div 
              id="mobile-menu"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[72px] left-2 right-2 z-40 lg:hidden bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 overflow-hidden flex flex-col max-h-[calc(100vh-90px)]"
            >
              <div className="px-4 py-4 space-y-1 overflow-y-auto">
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center justify-between px-4 min-h-[56px] rounded-xl text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      )
                    }
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 opacity-40" />
                  </NavLink>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link to="/dashboard" onClick={closeMobileMenu} className="block w-full focus:outline-none rounded-xl">
                      <Button className="w-full min-h-[56px] font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                        Tableau de bord
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full min-h-[56px] font-semibold border-slate-200 bg-white text-slate-700"
                      onClick={() => { signOut(); closeMobileMenu(); }}
                    >
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/register" onClick={closeMobileMenu} className="block w-full focus:outline-none rounded-xl">
                      <Button className="w-full min-h-[56px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        Créer un compte
                      </Button>
                    </Link>
                    <Link to="/login" onClick={closeMobileMenu} className="block w-full focus:outline-none rounded-xl">
                      <Button variant="outline" className="w-full min-h-[56px] font-semibold border-slate-200 bg-white text-slate-700">
                        Se connecter
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

