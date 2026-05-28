import { Award, CheckCircle2, Download, Share2 } from "lucide-react";

export function CertificatesView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl text-white">Mur des Diplômes</h1>
        <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
          <Award className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass rounded-4xl p-6 relative overflow-hidden group border border-amber-500/20 card-hover">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50"></div>
            
            {/* The Certificate Visual */}
            <div className="w-full aspect-[1.414/1] bg-[#f8f9fa] rounded-2xl p-6 relative flex flex-col items-center justify-center text-center shadow-inner border-[8px] border-double border-amber-600/30 mb-6 drop-shadow-md">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center opacity-50">
                    <span className="font-serif font-black text-amber-700 text-sm">N</span>
                </div>
                
                <p className="font-serif text-amber-800 text-[10px] tracking-widest uppercase mb-4">Certificat d'Achèvement</p>
                <h3 className="font-serif text-2xl font-black text-gray-900 mb-2">Blockchain & FinTech Privée</h3>
                <p className="text-gray-500 text-xs italic mb-4">Décerné majestueusement à</p>
                <p className="font-serif text-xl text-amber-700 font-bold border-b border-amber-700/30 pb-1 mb-6 px-4">Kouame</p>
                
                <div className="flex justify-between w-full px-4 text-gray-500 text-[8px] uppercase tracking-widest font-bold">
                    <span>Date: 28 Mai 2026</span>
                    <span>ID: CR-892-XT</span>
                </div>
                
                <div className="absolute bottom-4 right-4 text-amber-500 opacity-50">
                    <Award className="w-12 h-12" />
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="font-bold text-white text-lg mb-1">Blockchain & FinTech Privée</h3>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Certifié Ndara
                </p>
                
                <div className="flex gap-3">
                    <button className="flex-1 glass-light border border-white/10 hover:bg-white/10 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> HD (PDF)
                    </button>
                    <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.4)]">
                        <Share2 className="w-4 h-4" /> WhatsApp
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
