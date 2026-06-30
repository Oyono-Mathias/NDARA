import { User, ShieldCheck, Mail, MapPin, Globe, CreditCard, GraduationCap, Loader2 } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TopAppBar } from "../components/ui/TopAppBar";

export function AccountView() {
  const { currentUser, role } = useRole();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestInstructor = async () => {
      if (!currentUser?.uid || isRequesting) return;
      if (!window.confirm("Envoyer une demande pour devenir formateur (expert) ?")) return;

      setIsRequesting(true);
      try {
          await updateDoc(doc(db, "users", currentUser.uid), {
             role: "pending_instructor",
             status: "pending"
          });
          alert("Votre demande a bien été envoyée à l'administration !");
          window.location.reload(); // force reload context
      } catch (e: any) {
          console.error(e);
          alert("Erreur: " + e.message);
      } finally {
          setIsRequesting(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 bg-slate-950 min-h-screen">
      <TopAppBar title="Mon Compte" showBack={true} transparent />
      
      <div className="px-4 space-y-8 pt-4 w-full max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-white">Carte d'Identité</h1>
        
        {role === "student" && (
           <button 
              onClick={handleRequestInstructor}
              disabled={isRequesting}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-xl transition disabled:opacity-50"
           >
              {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
              Devenir Formateur
           </button>
        )}
        {(role === "pending_instructor" || role === "expert_pending") && (
            <div className="px-4 py-2 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                Validation en cours...
            </div>
        )}
      </div>

      {/* Main Identity Card */}
      <div className="glass rounded-4xl p-6 relative overflow-hidden border border-primary/20 glow-green">
         <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         
         <div className="flex flex-col items-center text-center relative z-10 mb-6">
             <div className="w-24 h-24 rounded-full bg-card border-2 border-primary/50 overflow-hidden ring-4 ring-primary/10 mb-4 relative">
                 <img src={currentUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-full h-full object-cover" />
                 <div className="absolute bottom-0 inset-x-0 h-1/3 bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/70 transition">
                     <p className="text-[10px] text-white font-bold uppercase tracking-wider">Modifier</p>
                 </div>
             </div>
             <h2 className="font-serif text-2xl font-bold text-white mb-1">{currentUser?.fullName || "Utilisateur"}</h2>
             <span className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest border border-primary/20 uppercase">
                <ShieldCheck className="w-3 h-3 mr-1 inline" /> GSM Vérifié
            </span>
         </div>

         <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                 <Mail className="w-5 h-5 text-gray-500" />
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Contact</p>
                     <p className="text-white text-sm font-medium">{currentUser?.email || "Non renseigné"} <span className="text-gray-600 mx-2">•</span> {currentUser?.phone || "+XXX XXX XXX"}</p>
                 </div>
             </div>
             <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                 <MapPin className="w-5 h-5 text-gray-500" />
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Localisation</p>
                     <p className="text-white text-sm font-medium">{currentUser?.country || "Non renseigné"}</p>
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
    </div>
  );
}
