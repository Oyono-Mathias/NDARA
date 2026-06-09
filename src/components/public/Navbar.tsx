import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-dark-primary/85 backdrop-blur-xl shadow-lg shadow-black/10" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald/30">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              NDARA
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
            >
              Fonctionnalités
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald rounded-full transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#security"
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
            >
              Sécurité
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald rounded-full transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
            >
              Tarifs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald rounded-full transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#market"
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
            >
              Marché
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald rounded-full transition-all group-hover:w-full"></span>
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="hidden sm:block px-5 py-2 bg-emerald text-dark-primary font-bold text-sm rounded-full hover:bg-emerald-light transition-all shadow-lg shadow-emerald/30 hover:shadow-emerald/40 hover:-translate-y-0.5"
            >
              Se connecter
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg touch-target"
              aria-label="Menu"
              aria-expanded={isOpen}
            >
              <span
                className="block w-5 h-0.5 bg-white rounded-full transition-all"
                style={
                  isOpen
                    ? { transform: "rotate(45deg) translate(5px, 5px)" }
                    : {}
                }
              ></span>
              <span
                className="block w-5 h-0.5 bg-white rounded-full transition-all"
                style={isOpen ? { opacity: 0 } : {}}
              ></span>
              <span
                className="block w-5 h-0.5 bg-white rounded-full transition-all"
                style={
                  isOpen
                    ? { transform: "rotate(-45deg) translate(4px, -4px)" }
                    : {}
                }
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${isOpen ? "block" : "hidden"} md:hidden bg-dark-primary/98 backdrop-blur-xl border-b border-dark-border animate-fade-in`}
      >
        <div className="px-4 py-3 space-y-1">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block py-3 text-base font-medium text-text-secondary hover:text-emerald transition-colors border-b border-dark-border"
          >
            Fonctionnalités
          </a>
          <a
            href="#security"
            onClick={() => setIsOpen(false)}
            className="block py-3 text-base font-medium text-text-secondary hover:text-emerald transition-colors border-b border-dark-border"
          >
            Sécurité
          </a>
          <a
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="block py-3 text-base font-medium text-text-secondary hover:text-emerald transition-colors border-b border-dark-border"
          >
            Tarifs
          </a>
          <a
            href="#market"
            onClick={() => setIsOpen(false)}
            className="block py-3 text-base font-medium text-text-secondary hover:text-emerald transition-colors"
          >
            Marché
          </a>
        </div>
      </div>
    </header>
  );
}
