import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { X, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function AdminKycReviewModal({ request, onClose, onProcessed }: { request: any, onClose: () => void, onProcessed: () => void }) {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const token = await firebaseUser!.getIdToken();
        const paths = request.documentStoragePath.split(',');
        const urls: string[] = [];
        for (const p of paths) {
          const res = await fetch(`/api/storage/signed-url?key=${encodeURIComponent(p)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.signedUrl) {
            urls.push(data.signedUrl);
          }
        }
        if (urls.length > 0) {
          setDocumentUrls(urls);
        } else {
          toast({ title: 'Erreur', description: 'Impossible de charger le document.', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Erreur', description: 'Erreur lors de la récupération du document.', variant: 'destructive' });
      }
    };
    fetchSignedUrl();
  }, [request]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectReason.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez préciser un motif de rejet.', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const token = await firebaseUser!.getIdToken();
      const res = await fetch('/api/kyc/admin/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
          action,
          reason: action === 'reject' ? rejectReason : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du traitement');

      toast({ title: 'Succès', description: `Demande ${action === 'approve' ? 'approuvée' : 'rejetée'}` });
      onProcessed();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Vérification KYC : {request.userName}</h2>
            <p className="text-slate-400 text-sm">{request.userEmail} — {request.idType === 'cni' ? "Carte d'identité" : 'Passeport'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center items-center">
          {documentUrls.length > 0 ? (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-full">
              {documentUrls.map((url, i) => (
                <img 
                  key={i}
                  src={url} 
                  alt={`Document KYC ${i + 1}`} 
                  className="max-w-full object-contain rounded-xl shadow-2xl border border-slate-800" 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-pink-500" />
              <p>Chargement sécurisé du document...</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900">
          {!showRejectForm ? (
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-3 bg-slate-800 hover:bg-red-500/20 text-red-400 font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Rejeter
              </button>
              <button 
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Approuver le KYC
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <label className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" /> Motif du rejet (Obligatoire)
                </label>
                <input 
                  type="text" 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Document flou, date expirée..."
                  className="w-full bg-slate-950 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setShowRejectForm(false)}
                  className="px-6 py-3 text-slate-400 hover:text-white font-bold"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleAction('reject')}
                  disabled={loading || !rejectReason.trim()}
                  className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Confirmer le rejet
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
