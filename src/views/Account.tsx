import { User, ShieldCheck, Mail, MapPin, Globe, CreditCard } from "lucide-react";

export function AccountView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-white">Carte d'Identité</h1>
      </div>

      {/* Main Identity Card */}
      <div className="glass rounded-4xl p-6 relative overflow-hidden border border-primary/20 glow-green">
         <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         
         <div className="flex flex-col items-center text-center relative z-10 mb-6">
             <div className="w-24 h-24 rounded-full bg-card border-2 border-primary/50 overflow-hidden ring-4 ring-primary/10 mb-4 relative">
                 <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                 <div className="absolute bottom-0 inset-x-0 h-1/3 bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/70 transition">
                     <p className="text-[10px] text-white font-bold uppercase tracking-wider">Modifier</p>
                 </div>
             </div>
             <h2 className="font-serif text-2xl font-bold text-white mb-1">Kouame O.</h2>
             <span className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest border border-primary/20 uppercase">
                <ShieldCheck className="w-3 h-3 mr-1 inline" /> GSM Vérifié
            </span>
         </div>

         <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                 <Mail className="w-5 h-5 text-gray-500" />
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Contact</p>
                     <p className="text-white text-sm font-medium">kouame.o@example.com <span className="text-gray-600 mx-2">•</span> +225 01 02 03 04</p>
                 </div>
             </div>
             <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                 <MapPin className="w-5 h-5 text-gray-500" />
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Localisation</p>
                     <p className="text-white text-sm font-medium">Côte d'Ivoire</p>
                 </div>
             </div>
              <div className="flex items-center gap-4">
                 <Globe className="w-5 h-5 text-gray-500" />
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Langue Préférée</p>
                     <p className="text-white text-sm font-medium">Sango (Prim), Français</p>
                 </div>
             </div>
         </div>
      </div>

       <div className="space-y-3">
          <h3 className="font-serif text-xl text-white mb-4">Informations Complémentaires</h3>
          <button className="w-full glass-light p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group text-left">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                      <User className="w-5 h-5"/>
                  </div>
                  <div>
                      <p className="text-white font-bold text-sm">Bio & Objectifs</p>
                      <p className="text-gray-500 text-xs">Mettre à jour ta description</p>
                  </div>
              </div>
          </button>
           <button className="w-full glass-light p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group text-left">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                      <CreditCard className="w-5 h-5"/>
                  </div>
                  <div>
                      <p className="text-white font-bold text-sm">Moyens de paiement</p>
                      <p className="text-gray-500 text-xs">Gérer tes numéros Mobile Money</p>
                  </div>
              </div>
          </button>
       </div>
    </div>
  );
}
