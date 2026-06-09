import { Link, Outlet } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#10B981] selection:text-black">
      {/* Navbar Publique */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10B981] to-teal-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                N
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-white drop-shadow-md">NDARA</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase text-gray-400">
            <Link to="/#features" className="hover:text-white transition">Platform</Link>
            <Link to="/#about" className="hover:text-white transition">About</Link>
            <Link to="/courses" className="text-[#10B981] hover:text-[#10B981]/80 transition">Catalogue</Link>
          </nav>
          <div className="flex items-center gap-4">
             <Link to="/auth" className="hidden md:block text-xs font-bold uppercase tracking-widest text-[#10B981] hover:text-white transition">
                Se Connecter
             </Link>
             <Link to="/auth" className="bg-[#10B981] text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#10B981]/80 transition flex items-center gap-2">
                 <span>Commencer</span>
                 <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
