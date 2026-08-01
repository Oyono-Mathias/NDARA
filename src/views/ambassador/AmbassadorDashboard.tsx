import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from "../../context/RoleContext";
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Copy, CheckCircle2, TrendingUp, Users, DollarSign, Share2 } from 'lucide-react';
import { logger } from '../../lib/logger';

export function AmbassadorDashboard() {
  const { firebaseUser } = useAuth();
  const { currentUser } = useRole();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [ambassadorData, setAmbassadorData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAmbassadorData = async () => {
      if (!firebaseUser) return;
      try {
        setLoading(true);
        const docRef = doc(db, 'ambassadors', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAmbassadorData(docSnap.data());
        } else {
          // Si l'utilisateur est admin, il peut voir cette page mais n'a pas forcément de doc ambassadeur.
          logger.warn("Aucun document ambassadeur trouvé pour", firebaseUser.uid);
        }
      } catch (err: any) {
        logger.error("Erreur chargement ambassadeur", err);
        toast({ title: "Erreur de chargement", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAmbassadorData();
  }, [firebaseUser]);

  const copyToClipboard = () => {
    if (ambassadorData?.referralLink) {
      navigator.clipboard.writeText(ambassadorData.referralLink);
      setCopied(true);
      toast({ title: "Lien copié dans le presse-papier !" });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ambassadorData) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Share2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Profil Ambassadeur Non Trouvé</h2>
        <p className="text-slate-400 max-w-md">
          Votre compte est marqué comme ambassadeur, mais aucune donnée d'affiliation n'a été générée. Veuillez contacter un administrateur pour réinitialiser votre rôle.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Share2 className="text-blue-500 w-8 h-8" />
          Espace Ambassadeur
        </h1>
        <p className="text-slate-400">Gérez vos parrainages et suivez vos performances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filleuls</p>
              <p className="text-2xl font-black text-white">{ambassadorData.totalReferrals || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ventes</p>
              <p className="text-2xl font-black text-white">{ambassadorData.totalSales || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Commissions (XAF)</p>
              <p className="text-2xl font-black text-white">{ambassadorData.totalCommission || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-black text-white mb-8">Votre Lien de Parrainage</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Code Ambassadeur</label>
              <div className="inline-block px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xl font-bold text-blue-400 tracking-wider">
                {ambassadorData.referralCode}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Lien Unique</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  readOnly 
                  value={ambassadorData.referralLink} 
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 px-6 py-4 rounded-xl font-mono text-sm focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'COPIÉ !' : 'COPIER LE LIEN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-8 md:p-12">
        <h2 className="text-xl font-bold text-white mb-6">Informations du Profil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nom Complet</p>
            <p className="text-slate-300 font-medium">{currentUser?.displayName || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
            <p className="text-slate-300 font-medium">{currentUser?.email || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date d'activation</p>
            <p className="text-slate-300 font-medium">
              {ambassadorData.activatedAt?.toDate ? ambassadorData.activatedAt.toDate().toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Inconnue'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Statut</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${ambassadorData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {ambassadorData.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
