import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../hooks/use-toast';

export function AdminAmbassadorRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      // For now we'll simulate the data if it doesn't exist yet
      const snap = await getDocs(collection(db, 'affiliate_rewards_config'));
      if (!snap.empty) {
        setRewards(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).sort((a: any, b: any) => a.salesTarget - b.salesTarget));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing.id) {
        // update
        await updateDoc(doc(db, 'affiliate_rewards_config', editing.id), editing);
        setRewards(prev => prev.map(r => r.id === editing.id ? editing : r).sort((a: any, b: any) => a.salesTarget - b.salesTarget));
      } else {
        // create
        const newObj = { ...editing, id: Date.now().toString() };
        await addDoc(collection(db, 'affiliate_rewards_config'), editing);
        setRewards(prev => [...prev, newObj].sort((a: any, b: any) => a.salesTarget - b.salesTarget));
      }
      setEditing(null);
      toast({ title: "Succès", description: "Récompense enregistrée." });
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette récompense ?")) return;
    try {
      await deleteDoc(doc(db, 'affiliate_rewards_config', id));
      setRewards(prev => prev.filter(r => r.id !== id));
      toast({ title: "Succès", description: "Récompense supprimée." });
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Récompenses</h1>
          <p className="text-slate-400 mt-2">Gérez les cadeaux et bonus par palier de ventes.</p>
        </div>
        <button 
          onClick={() => setEditing({ salesTarget: 0, type: 'bonus', value: '' })}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvelle Récompense
        </button>
      </div>

      {editing && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700/50 space-y-4">
          <h3 className="text-lg font-bold text-white">{editing.id ? 'Modifier' : 'Créer'} une récompense</h3>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-300">Objectif (Nombre de ventes)</label>
              <input 
                type="number" 
                value={editing.salesTarget}
                onChange={e => setEditing({...editing, salesTarget: Number(e.target.value)})}
                className="w-full bg-slate-800 p-3 text-white rounded-xl border border-slate-700" 
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-300">Type de récompense</label>
              <select 
                value={editing.type}
                onChange={e => setEditing({...editing, type: e.target.value})}
                className="w-full bg-slate-800 p-3 text-white rounded-xl border border-slate-700"
              >
                <option value="bonus">Bonus Financier</option>
                <option value="gift">Cadeau / Objet</option>
                <option value="trip">Voyage</option>
                <option value="vehicle">Véhicule</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-300">Valeur / Nom</label>
              <input 
                type="text" 
                placeholder="ex: 10 000 FCFA ou iPhone" 
                value={editing.value}
                onChange={e => setEditing({...editing, value: e.target.value})}
                className="w-full bg-slate-800 p-3 text-white rounded-xl border border-slate-700" 
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setEditing(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium">Annuler</button>
            <button onClick={handleSave} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold">Enregistrer</button>
          </div>
        </div>
      )}

      <div className="space-y-4 relative">
        <div className="absolute top-0 bottom-0 left-8 w-1 bg-slate-800 rounded-full z-0"></div>
        {rewards.map((r: any, index: number) => (
          <div key={r.id} className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-purple-400" />
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-slate-400 mb-1">{r.salesTarget} ventes</p>
                <p className="text-xl font-black text-white">{r.value}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(r)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                  <Edit className="w-5 h-5"/>
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
