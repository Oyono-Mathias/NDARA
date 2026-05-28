import { Users, Search, Filter, Shield, MoreVertical } from "lucide-react";

export function AdminUsers() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Users className="text-[#10B981] w-6 h-6" /> IDENTITY_REGISTRY
        </h1>
        <div className="text-gray-500 text-xs font-bold">Total: 12,482</div>
      </div>

       <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[#10B981] w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher par UID, Email, Nom..." 
              className="w-full bg-black border border-[#10B981]/30 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all text-sm placeholder:text-gray-600"
            />
          </div>
          <button className="px-4 py-3 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 transition flex items-center gap-2 text-sm font-bold">
              <Filter className="w-4 h-4" /> Filtres
          </button>
       </div>

       {/* Data Table */}
       <div className="w-full overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/5 border-y border-[#10B981]/20">
                   <tr>
                       <th className="px-4 py-3">User UID</th>
                       <th className="px-4 py-3">Identité</th>
                       <th className="px-4 py-3">Rôle</th>
                       <th className="px-4 py-3">Statut GSM</th>
                       <th className="px-4 py-3">Revenus générés</th>
                       <th className="px-4 py-3 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-black">
                   <UserRow uid="U_892A" name="Kouame" email="kouame.o@example.com" role="STUDENT" verified rev="0 XAF" />
                   <UserRow uid="U_14X2" name="Emmanuel D." email="expert.em@example.com" role="INSTRUCTOR" verified rev="8.5M XAF" highlight />
                   <UserRow uid="U_9B4R" name="Sylvie M." email="sylvie@mail.com" role="STUDENT" rev="0 XAF" />
                   <UserRow uid="U_77Z1" name="Ibrahim K." email="ibr.k@mail.com" role="STUDENT" suspended rev="0 XAF" />
               </tbody>
           </table>
       </div>

       {/* Pagination */}
       <div className="flex justify-between items-center px-4 py-3 border-t border-[#10B981]/20 text-[10px] font-bold uppercase tracking-widest text-gray-500">
           <span>Affichage 1-10 sur 12,482</span>
           <div className="flex gap-2">
               <button className="px-3 py-1 border border-white/10 hover:text-white disabled:opacity-50" disabled>PREV</button>
               <button className="px-3 py-1 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10">NEXT</button>
           </div>
       </div>
    </div>
  );
}

function UserRow({ uid, name, email, role, verified, suspended, rev, highlight }: any) {
    return (
        <tr className={`hover:bg-white/5 transition ${highlight ? 'border-l-2 border-l-[#10B981]' : ''}`}>
            <td className="px-4 py-4 font-mono text-xs">{uid}</td>
            <td className="px-4 py-4">
                <div className="text-white font-bold">{name}</div>
                <div className="text-[10px] text-gray-500">{email}</div>
            </td>
            <td className="px-4 py-4">
                <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest border ${role === 'INSTRUCTOR' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-blue-400 border-blue-400/30 bg-blue-400/10'}`}>
                    {role}
                </span>
            </td>
            <td className="px-4 py-4">
                {verified ? (
                    <span className="text-[#10B981] flex items-center gap-1 text-[10px] font-bold uppercase"><Shield className="w-3 h-3"/> Vérifié</span>
                ) : suspended ? (
                    <span className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1">Suspendu</span>
                ) : (
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Non vérifié</span>
                )}
            </td>
            <td className="px-4 py-4 text-white font-bold text-xs">{rev}</td>
            <td className="px-4 py-4 text-right">
                <button className="p-1 hover:bg-white/10 rounded-sm text-gray-400 hover:text-white transition">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
