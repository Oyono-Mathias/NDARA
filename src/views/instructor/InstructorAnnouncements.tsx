import { AnnouncementsClient } from '../../components/instructor/announcements/AnnouncementsClient';
import { Megaphone } from 'lucide-react';

export function InstructorAnnouncements() {
  return (
    <div className="flex flex-col gap-0 pb-24 min-h-screen bg-transparent font-sans -m-4 md:-m-8 p-4 md:p-8 relative">
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />
      
      <header className="z-10 bg-[#0f172a]/95 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/5 animate-in fade-in duration-700">
        <div className="flex items-center gap-2 text-primary mb-2">
            <Megaphone className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Communication de masse</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Annonces</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Diffusez vos messages importants à tous vos apprenants.</p>
      </header>

      <div className="w-full animate-in fade-in duration-700 delay-150">
        <AnnouncementsClient />
      </div>
    </div>
  );
}
