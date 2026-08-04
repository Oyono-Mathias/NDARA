import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Trophy, Medal, Target, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

export function AdminAmbassadorProgram() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'levels' | 'badges' | 'challenges'>('levels');
  const [loading, setLoading] = useState(true);
  
  const [levels, setLevels] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const lSnap = await getDocs(query(collection(db, 'affiliate_levels')));
      setLevels(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const bSnap = await getDocs(query(collection(db, 'affiliate_badges')));
      setBadges(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const cSnap = await getDocs(query(collection(db, 'affiliate_challenges')));
      setChallenges(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevel = async (level: any) => {
    try {
      const id = level.id || level.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await setDoc(doc(db, 'affiliate_levels', id), {
        name: level.name,
        color: level.color || 'gray',
        minSalesCount: Number(level.minSalesCount || 0),
        minSalesAmount: Number(level.minSalesAmount || 0),
        bonusAmount: Number(level.bonusAmount || 0)
      });
      toast({ title: "Niveau enregistré" });
      loadData();
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!window.confirm("Supprimer ce niveau ?")) return;
    try {
      await deleteDoc(doc(db, 'affiliate_levels', id));
      toast({ title: "Niveau supprimé" });
      loadData();
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveBadge = async (badge: any) => {
    try {
      const id = badge.id || badge.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await setDoc(doc(db, 'affiliate_badges', id), {
        name: badge.name,
        description: badge.description || '',
        conditionType: badge.conditionType, // 'referrals', 'sales_count', 'earnings'
        conditionValue: Number(badge.conditionValue || 0),
        bonusAmount: Number(badge.bonusAmount || 0)
      });
      toast({ title: "Badge enregistré" });
      loadData();
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Trophy className="text-yellow-500 w-8 h-8" />
          Programme Ambassadeur
        </h1>
        <p className="text-slate-400">Gérez les niveaux, badges et défis du programme d'affiliation.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-800 pb-2">
        <button onClick={() => setActiveTab('levels')} className={`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg ${activeTab === 'levels' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Niveaux</button>
        <button onClick={() => setActiveTab('badges')} className={`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg ${activeTab === 'badges' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Badges</button>
        <button onClick={() => setActiveTab('challenges')} className={`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg ${activeTab === 'challenges' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Défis</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          {activeTab === 'levels' && (
            <LevelsManager levels={levels} onSave={handleSaveLevel} onDelete={handleDeleteLevel} />
          )}
          {activeTab === 'badges' && (
            <BadgesManager badges={badges} onSave={handleSaveBadge} onDelete={async (id) => { await deleteDoc(doc(db, 'affiliate_badges', id)); loadData(); }} />
          )}
          {activeTab === 'challenges' && (
            <ChallengesManager challenges={challenges} onSave={async (c) => { 
                const id = c.id || c.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                await setDoc(doc(db, 'affiliate_challenges', id), c);
                toast({title:"Défi enregistré"}); loadData();
             }} onDelete={async (id) => { await deleteDoc(doc(db, 'affiliate_challenges', id)); loadData(); }} />
          )}
        </div>
      )}
    </div>
  );
}

function LevelsManager({ levels, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Niveaux</h2>
        <button onClick={() => setEditing({})} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau Niveau
        </button>
      </div>
      
      {editing && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <input type="text" placeholder="Nom du niveau (ex: Bronze)" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-slate-800 p-2 text-white rounded" />
          <div className="flex gap-4">
            <input type="number" placeholder="Ventes minimum" value={editing.minSalesCount || ''} onChange={e => setEditing({...editing, minSalesCount: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
            <input type="number" placeholder="CA minimum" value={editing.minSalesAmount || ''} onChange={e => setEditing({...editing, minSalesAmount: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
            <input type="number" placeholder="Bonus (XAF)" value={editing.bonusAmount || ''} onChange={e => setEditing({...editing, bonusAmount: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onSave(editing); setEditing(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded font-bold">Enregistrer</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-700 text-white rounded">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {levels.map((l: any) => (
          <div key={l.id} className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <div>
              <p className="font-bold text-lg text-white">{l.name}</p>
              <p className="text-sm text-slate-400">Min. {l.minSalesCount} ventes ou {l.minSalesAmount?.toLocaleString()} XAF • Bonus: {l.bonusAmount?.toLocaleString()} XAF</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(l)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"><Edit className="w-4 h-4"/></button>
              <button onClick={() => onDelete(l.id)} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesManager({ badges, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Badges</h2>
        <button onClick={() => setEditing({})} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau Badge
        </button>
      </div>
      
      {editing && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <input type="text" placeholder="Nom du badge" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-slate-800 p-2 text-white rounded" />
          <input type="text" placeholder="Description" value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-slate-800 p-2 text-white rounded" />
          <div className="flex gap-4">
            <select value={editing.conditionType || ''} onChange={e => setEditing({...editing, conditionType: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded">
              <option value="">Condition...</option>
              <option value="referrals">Nombre de filleuls</option>
              <option value="sales_count">Nombre de ventes</option>
              <option value="earnings">Gains cumulés</option>
            </select>
            <input type="number" placeholder="Valeur cible" value={editing.conditionValue || ''} onChange={e => setEditing({...editing, conditionValue: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
            <input type="number" placeholder="Bonus (XAF)" value={editing.bonusAmount || ''} onChange={e => setEditing({...editing, bonusAmount: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onSave(editing); setEditing(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded font-bold">Enregistrer</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-700 text-white rounded">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {badges.map((b: any) => (
          <div key={b.id} className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <div>
              <p className="font-bold text-lg text-white">{b.name}</p>
              <p className="text-sm text-slate-400">{b.description}</p>
              <p className="text-xs text-purple-400 mt-1">Si {b.conditionType} {">="} {b.conditionValue} • Bonus: {b.bonusAmount} XAF</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(b)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"><Edit className="w-4 h-4"/></button>
              <button onClick={() => onDelete(b.id)} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengesManager({ challenges, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Défis</h2>
        <button onClick={() => setEditing({})} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau Défi
        </button>
      </div>
      
      {editing && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <input type="text" placeholder="Nom du défi" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-slate-800 p-2 text-white rounded" />
          <div className="flex gap-4">
            <select value={editing.conditionType || ''} onChange={e => setEditing({...editing, conditionType: e.target.value})} className="w-1/3 bg-slate-800 p-2 text-white rounded">
              <option value="">Condition...</option>
              <option value="referrals">Nombre de filleuls</option>
              <option value="sales_count">Nombre de ventes</option>
            </select>
            <input type="number" placeholder="Objectif" value={editing.conditionValue || ''} onChange={e => setEditing({...editing, conditionValue: Number(e.target.value)})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
            <input type="number" placeholder="Bonus (XAF)" value={editing.bonusAmount || ''} onChange={e => setEditing({...editing, bonusAmount: Number(e.target.value)})} className="w-1/3 bg-slate-800 p-2 text-white rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onSave(editing); setEditing(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded font-bold">Enregistrer</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-700 text-white rounded">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {challenges.map((c: any) => (
          <div key={c.id} className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <div>
              <p className="font-bold text-lg text-white">{c.name}</p>
              <p className="text-xs text-purple-400 mt-1">Objectif: {c.conditionValue} {c.conditionType} • Bonus: {c.bonusAmount} XAF</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"><Edit className="w-4 h-4"/></button>
              <button onClick={() => onDelete(c.id)} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
