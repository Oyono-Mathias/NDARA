import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../providers/AppProvider';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { classNames } from '../../lib/utils';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useApp();

  const publicLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Cours', path: '/courses' },
    { name: 'À propos', path: '/about' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[64px]">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex shrink-0 items-center min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" onClick={closeMobileMenu}>
              <span className="font-bold text-xl text-blue-600 tracking-tight">NDARA</span>
              <span className="font-bold text-xl text-gray-900 tracking-tight ml-1">AFRIQUE</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    classNames(
                      "inline-flex items-center px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard">
                  <Button variant="ghost">Tableau de bord</Button>
                </Link>
                <Button variant="outline" onClick={signOut}>Déconnexion</Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="focus:outline-none">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/register" className="focus:outline-none">
                  <Button variant="primary">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-transform"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  classNames(
                    "block px-3 py-3 rounded-xl text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          
          <div className="pt-4 pb-4 border-t border-gray-100">
            <div className="flex items-center px-4 mb-4">
              <LanguageSwitcher className="w-full" />
            </div>
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <Link to="/dashboard" onClick={closeMobileMenu} className="block w-full">
                  <Button variant="primary" fullWidth>Tableau de bord</Button>
                </Link>
                <Button variant="outline" fullWidth onClick={() => { signOut(); closeMobileMenu(); }}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="px-4 flex flex-col gap-3">
                <Link to="/login" onClick={closeMobileMenu} className="block w-full">
                  <Button variant="outline" fullWidth>Connexion</Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="block w-full">
                  <Button variant="primary" fullWidth>S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
