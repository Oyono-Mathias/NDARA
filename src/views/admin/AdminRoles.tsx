import { Shield, Key, EyeOff } from "lucide-react";

export function AdminRoles() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Shield className="text-[#10B981] w-6 h-6" /> MATRICE_ROLES
        </h1>
        <button className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/50 font-bold uppercase tracking-widest text-xs hover:bg-[#10B981]/30 transition">
            Nouveau Rôle
        </button>
      </div>

       <div className="w-full overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/5 border-y border-[#10B981]/20">
                   <tr>
                       <th className="px-4 py-3">Rôle</th>
                       <th className="px-4 py-3">Description</th>
                       <th className="px-4 py-3">Utilisateurs</th>
                       <th className="px-4 py-3">Niveau de privilège</th>
                       <th className="px-4 py-3 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-black">
                   <RoleRow role="SUPER_ADMIN" desc="Accès total (Root)" count="2" level="100 (Max)" />
                   <RoleRow role="MODERATOR" desc="Validation des cours & Comms" count="5" level="50" />
                   <RoleRow role="FINANCE_AUDIT" desc="Lecture seule Registres" count="1" level="40" />
                   <RoleRow role="INSTRUCTOR" desc="Créateur de contenu" count="142" level="20" />
                   <RoleRow role="STUDENT" desc="Utilisateur standard" count="12,333" level="10" />
               </tbody>
           </table>
       </div>
    </div>
  );
}

function RoleRow({ role, desc, count, level }: any) {
    const isRoot = role === 'SUPER_ADMIN';
    return (
        <tr className={`hover:bg-white/5 transition`}>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    {isRoot ? <Key className="w-4 h-4 text-red-500" /> : <Shield className="w-4 h-4 text-gray-500" />}
                    <span className={`font-bold ${isRoot ? 'text-red-500' : 'text-white'}`}>{role}</span>
                </div>
            </td>
            <td className="px-4 py-4 text-xs">{desc}</td>
            <td className="px-4 py-4 font-bold text-gray-300">{count}</td>
            <td className="px-4 py-4">
                <span className="text-[#10B981] font-black">{level}</span>
            </td>
            <td className="px-4 py-4 text-right">
                {isRoot ? (
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                        <EyeOff className="w-3 h-3" /> Immuable
                    </span>
                ) : (
                    <button className="text-[#10B981] text-xs font-bold uppercase tracking-widest hover:text-white transition">Modifier</button>
                )}
            </td>
        </tr>
    );
}
