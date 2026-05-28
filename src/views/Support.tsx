import { MessageSquare, Mail, AlertTriangle } from "lucide-react";

export function SupportView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl text-white">Support</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">Nous sommes là pour vous aider avec la plateforme Ndara.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-3xl p-6 relative overflow-hidden group hover:border border-white/5 border-green-500/30 transition cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">WhatsApp Direct</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Réponse en moins de 5 minutes par notre équipe de modérateurs.</p>
          </div>
          
           <div className="glass rounded-3xl p-6 relative overflow-hidden group hover:border border-white/5 border-blue-500/30 transition cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Ticket Email</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Pour les requêtes complexes liées à la facturation ou aux diplômes.</p>
          </div>
      </div>

      <div className="glass rounded-4xl p-6 border border-white/5">
          <h3 className="font-serif text-xl text-white mb-6">Ouvrir un ticket</h3>
          
          <div className="space-y-4">
              <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Sujet / Problème</label>
                  <input 
                      type="text"
                      className="w-full bg-card border border-white/10 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-white/30 text-sm transition"
                  />
              </div>
              <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Description détaillée</label>
                  <textarea 
                      rows={4}
                      className="w-full bg-card border border-white/10 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-white/30 text-sm transition resize-none"
                  ></textarea>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition">
                 Soumettre la requête
              </button>
          </div>
      </div>
    </div>
  );
}
