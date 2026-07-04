import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0B0F19] flex flex-col antialiased">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <BookOpen className="w-6 h-6 text-emerald-400" />
             </div>
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-black text-white tracking-tight">
            NDARA
          </h2>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Plateforme d'excellence
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/[0.02] py-8 px-4 shadow-xl border border-white/5 sm:rounded-3xl sm:px-10 backdrop-blur-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
