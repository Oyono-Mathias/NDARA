import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Wallet, Users, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';

interface AmbassadorStats {
  estimatedCommissions: number;
  pendingCommissions: number;
  activeReferrals: number;
  rank: number;
}

export const AmbassadorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState<AmbassadorStats | null>(null);

  useEffect(() => {
    // Simulation réseau
    const timer = setTimeout(() => {
      setStats({
        estimatedCommissions: 150000,
        pendingCommissions: 25000,
        activeReferrals: 12,
        rank: 4
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleWithdrawIntent = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      alert("Intention de retrait enregistrée. (Le flux sécurisé PIN n'est pas déclenché ici, en attente backend).");
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord Ambassadeur</h1>
        <p className="text-sm text-gray-500">Bienvenue dans votre espace partenaire.</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les données financières affichées ici sont purement <strong>informatives / estimations</strong>, soumises à validation serveur finale.</p>
      </div>

      {loading || !stats ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-blue-800 mb-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">Solde Estimé</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.estimatedCommissions.toLocaleString()} XAF</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-orange-600 mb-2">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="text-sm font-medium">En attente</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.pendingCommissions.toLocaleString()} XAF</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-green-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Filleuls actifs</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.activeReferrals}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleWithdrawIntent} 
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Wallet className="w-5 h-5 mr-2" />}
              Demander un retrait
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
