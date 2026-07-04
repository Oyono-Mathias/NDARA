import React from 'react';

export function AdminFooter() {
    return (
        <footer className="shrink-0 py-4 px-4 border-t border-slate-800/50 text-center flex flex-col md:flex-row items-center justify-between gap-2 bg-[#090E17]">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">© {new Date().getFullYear()} Ndara Afrique. Tous droits réservés.</span>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Admin Core v2.0 • Status: <span className="text-emerald-500">Online</span></span>
        </footer>
    );
}
