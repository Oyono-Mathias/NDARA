import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export function AmbassadorKyc() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [idType, setIdType] = useState<string>('cni');

  useEffect(() => {
    if (firebaseUser?.uid) {
      loadKycStatus();
    }
  }, [firebaseUser]);

  const loadKycStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser!.uid));
      if (userDoc.exists()) {
        const status = userDoc.data().kycStatus || 'unverified';
        setKycStatus(status);
        if (status === 'rejected') {
           setRejectReason(userDoc.data().kycRejectedReason || 'Motif non spécifié');
        }
      }
    } catch (error) {
      console.error('Error loading KYC:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un document', variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);

      // 1. Upload file securely
      const formData = new FormData();
      formData.append('file', file);
      
      const token = await firebaseUser!.getIdToken();
      
      const uploadRes = await fetch('/api/storage/kyc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Erreur lors de l\'upload');

      const storagePath = uploadData.key;
      const fileName = file.name;

      // 2. Submit KYC request
      const submitRes = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentStoragePath: storagePath,
          documentFileName: fileName,
          idType
        })
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || 'Erreur lors de la soumission');

      toast({ title: 'Succès', description: 'Votre demande KYC a été soumise avec succès.' });
      setKycStatus('pending');
      setFile(null);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Vérification d'identité (KYC)</h1>
        <p className="text-slate-400 mt-2">Pour des raisons légales et de sécurité, nous devons vérifier votre identité avant d'autoriser les retraits.</p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
        <div className="mb-8 p-4 rounded-xl border flex items-center gap-4 bg-slate-900/50 border-slate-700">
           {kycStatus === 'unverified' && <AlertCircle className="w-8 h-8 text-slate-400" />}
           {kycStatus === 'pending' && <Clock className="w-8 h-8 text-yellow-500" />}
           {kycStatus === 'approved' && <CheckCircle className="w-8 h-8 text-emerald-500" />}
           {kycStatus === 'rejected' && <XCircle className="w-8 h-8 text-red-500" />}
           
           <div>
             <h3 className="font-bold text-white uppercase tracking-widest text-sm">Statut Actuel</h3>
             <p className={`text-lg font-bold ${
               kycStatus === 'unverified' ? 'text-slate-400' :
               kycStatus === 'pending' ? 'text-yellow-500' :
               kycStatus === 'approved' ? 'text-emerald-500' :
               'text-red-500'
             }`}>
               {kycStatus === 'unverified' ? 'Non vérifié' :
                kycStatus === 'pending' ? "En cours d'examen" :
                kycStatus === 'approved' ? 'Vérifié' : 'Rejeté'}
             </p>
           </div>
        </div>

        {kycStatus === 'rejected' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h4 className="font-bold text-red-400 flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5" />
              Motif du rejet
            </h4>
            <p className="text-red-200 text-sm">{rejectReason}</p>
          </div>
        )}

        {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Type de document</label>
              <select 
                value={idType} 
                onChange={(e) => setIdType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              >
                <option value="cni">Carte Nationale d'Identité (CNI)</option>
                <option value="passport">Passeport</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Document (Photo ou Scan clair)</label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-pink-500/50 transition-colors bg-slate-900/50">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="kyc-file" 
                />
                <label htmlFor="kyc-file" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-slate-300 font-medium">Cliquez pour choisir un fichier</span>
                  <span className="text-slate-500 text-sm mt-1">JPEG, PNG ou PDF (Max 5MB)</span>
                  {file && <span className="mt-4 text-pink-400 font-bold bg-pink-500/10 px-3 py-1 rounded-full text-sm">{file.name}</span>}
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={uploading || !file}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours...</>
              ) : (
                <><FileText className="w-5 h-5" /> Soumettre le document</>
              )}
            </button>
          </form>
        )}

        {kycStatus === 'pending' && (
          <div className="text-center p-8 bg-slate-900/50 rounded-xl border border-slate-700">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Vérification en cours</h3>
            <p className="text-slate-400">Notre équipe examine actuellement votre document. Ce processus peut prendre de 24h à 48h ouvrées. Vous serez notifié du résultat.</p>
          </div>
        )}

        {kycStatus === 'approved' && (
          <div className="text-center p-8 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Identité vérifiée !</h3>
            <p className="text-emerald-200/70">Votre compte est totalement validé. Vous pouvez désormais demander le paiement de vos commissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
