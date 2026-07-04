import re

with open('src/views/admin/AdminRoles.tsx', 'w') as f:
    f.write('''import React, { useState, useEffect } from "react";
import { Shield, Key, EyeOff, Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export function AdminRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'roles'), (snap) => {
      setRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreateNew = () => {
    setEditingRole({ id: '', name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (r: any) => {
    setEditingRole({ ...r });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (id === 'SUPER_ADMIN' || id === 'admin') return alert("Impossible de supprimer le rôle root.");
    if (!window.confirm("Voulez-vous vraiment supprimer ce rôle ?")) return;
    try {
      await deleteDoc(doc(db, 'roles', id));
    } catch(e) {
      alert("Erreur de suppression");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-500/20 pb-6 mb-6 gap-4">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Shield className="text-emerald-500 w-6 h-6" /> MATRICE_ROLES & PERMISSIONS
        </h1>
        <button 
          onClick={handleCreateNew}
          className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 font-bold uppercase tracking-widest text-xs hover:bg-emerald-500/30 transition rounded-xl flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Nouveau Rôle
        </button>
      </div>

       <div className="w-full overflow-x-auto rounded-2xl border border-white/10">
           <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 border-b border-emerald-500/20">
                   <tr>
                       <th className="px-4 py-3">Rôle / ID</th>
                       <th className="px-4 py-3">Description</th>
                       <th className="px-4 py-3">Permissions (Modules)</th>
                       <th className="px-4 py-3 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-[#090E17]">
                   {roles.map(r => (
                       <RoleRow 
                         key={r.id} 
                         role={r} 
                         onEdit={() => handleEdit(r)} 
                         onDelete={() => handleDelete(r.id)} 
                       />
                   ))}
                   {roles.length === 0 && (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-500">Aucun rôle personnalisé configuré. Les rôles standards (admin, student, instructor) s'appliquent.</td></tr>
                   )}
               </tbody>
           </table>
       </div>

       {isModalOpen && (
         <RoleEditModal 
           roleData={editingRole} 
           onClose={() => setIsModalOpen(false)} 
         />
       )}
    </div>
  );
}

const AVAILABLE_MODULES = [
  'dashboard', 'members', 'catalog', 'treasury', 'support', 'settings', 'roles'
];

function RoleEditModal({ roleData, onClose }: { roleData: any, onClose: () => void }) {
  const [formData, setFormData] = useState(roleData);
  const [saving, setSaving] = useState(false);

  const togglePermission = (mod: string) => {
    setFormData((prev: any) => {
      const perms = prev.permissions || [];
      if (perms.includes(mod)) {
        return { ...prev, permissions: perms.filter((p: string) => p !== mod) };
      } else {
        return { ...prev, permissions: [...perms, mod] };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Le nom est requis.");
    setSaving(true);
    try {
      const id = formData.id || formData.name.toUpperCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'roles', id), {
        name: formData.name,
        description: formData.description || '',
        permissions: formData.permissions || [],
        updatedAt: new Date()
      }, { merge: true });
      onClose();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090E17]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B111A] border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">
          {roleData.id ? 'Modifier le Rôle' : 'Créer un Rôle'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom du rôle</label>
            <input 
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ex: MODERATEUR"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
            <input 
              type="text"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ex: Accès limité au support..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Permissions Modules</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODULES.map(mod => {
                const isSelected = (formData.permissions || []).includes(mod);
                return (
                  <div 
                    key={mod}
                    onClick={() => togglePermission(mod)}
                    className={`p-3 border rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{mod}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-slate-700 text-slate-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleRow({ role, onEdit, onDelete }: any) {
    const isRoot = role.id === 'SUPER_ADMIN' || role.id === 'admin';
    return (
        <tr className={`hover:bg-white/5 transition`}>
            <td className="px-4 py-4">
                <div className="flex flex-col">
                    <span className={`font-bold ${isRoot ? 'text-red-500' : 'text-white'}`}>{role.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{role.id}</span>
                </div>
            </td>
            <td className="px-4 py-4 text-xs text-slate-400">{role.description}</td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-1">
                {(role.permissions || []).map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-[9px] uppercase tracking-widest">{p}</span>
                ))}
              </div>
            </td>
            <td className="px-4 py-4 text-right">
                {isRoot ? (
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                        <EyeOff className="w-3 h-3" /> Immuable
                    </span>
                ) : (
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={onEdit} className="text-blue-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={onDelete} className="text-red-400 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                )}
            </td>
        </tr>
    );
}
''')
