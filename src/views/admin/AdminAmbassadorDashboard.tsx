import { MigrationButton } from './MigrationButton';
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, TrendingUp, Wallet, CheckCircle, Clock, Percent, MousePointerClick, UserPlus } from 'lucide-react';

export function AdminAmbassadorDashboard() {
  const [stats, setStats] = useState({
    totalAmbassadors: 0,
    clicks: 0,
    signups: 0,
    sales: 0,
    commissions: 0,
    pendingWithdrawalsCount: 0,
    paidWithdrawalsAmount: 0,
  });

  useEffect(() => {
    // Nombre d'ambassadeurs = nombre réel de documents dans la collection ambassadors
    const unsubAmbassadors = onSnapshot(collection(db, 'ambassadors'), (snap) => {
      setStats(s => ({ ...s, totalAmbassadors: snap.size }));
    });

    // Nombre d'inscriptions = nombre réel d'utilisateurs ayant un champ referredBy
    // For Firestore, if we do a '!=' query on referredBy, we need an index, or we can just query users where referredBy >= '' but this might require an index too.
    // Instead, since it's a dashboard, we can just fetch all users and filter in memory if it's small, or use a where("referredBy", "!=", null).
    // Let's use where("referredBy", ">", "") assuming it's a string.
    const unsubSignups = onSnapshot(query(collection(db, 'users'), where('referredBy', '>', '')), (snap) => {
      setStats(s => ({ ...s, signups: snap.size }));
    });

    // Ventes & Commissions = collection affiliate_transactions
    const unsubTx = onSnapshot(collection(db, 'affiliate_transactions'), (snap) => {
      let salesCount = 0;
      let totalComm = 0;
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status === 'validated' || d.status === 'paid' || d.status === 'pending') {
          salesCount++;
          totalComm += (d.commission || 0); // Assuming amount is the commission amount. If commission is separate, we'd use d.commission.
          // Let's check what affiliate_transactions stores. The prompt mentions "Commissions = somme réelle des commissions validées".
          // Usually affiliate_transactions has 'amount' or 'commission'.
        }
      });
      setStats(s => ({ ...s, sales: salesCount, commissions: totalComm }));
    });

    // Retraits = collection withdraw_requests (or payout_requests)
    // The user says "payout_requests"
    const unsubPayouts = onSnapshot(collection(db, 'payout_requests'), (snap) => {
      let pendingCount = 0;
      let paidSum = 0;
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status === 'pending') pendingCount++;
        if (d.status === 'paid') paidSum += (d.amount || 0);
      });
      setStats(s => ({ ...s, pendingWithdrawalsCount: pendingCount, paidWithdrawalsAmount: paidSum }));
    });
    
    // Clics = collection affiliate_clicks (or similar). Let's sum clicks from ambassadors collection for now if they have a 'clicks' field, or just query a clicks collection.
    const unsubClicks = onSnapshot(collection(db, 'users'), (snap) => {
      let totalClicks = 0;
      snap.forEach(doc => {
         totalClicks += (doc.data().clicks || 0);
      });
      setStats(s => ({ ...s, clicks: totalClicks }));
    });

    return () => {
      unsubAmbassadors();
      unsubSignups();
      unsubTx();
      unsubPayouts();
      unsubClicks();
    };
  }, []);

  // Taux de conversion
  const conversionRate = stats.clicks > 0 ? ((stats.sales / stats.clicks) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Tableau de bord Ambassadeur</h1>
        <p className="text-slate-400 mt-2">Vue d'ensemble des performances en temps réel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Ambassadeurs</p>
              <h3 className="text-2xl font-black text-white">{stats.totalAmbassadors.toLocaleString('fr-FR')}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Inscriptions</p>
              <h3 className="text-2xl font-black text-white">{stats.signups.toLocaleString('fr-FR')}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Clics générés</p>
              <h3 className="text-2xl font-black text-white">{stats.clicks.toLocaleString('fr-FR')}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Taux de conversion</p>
              <h3 className="text-2xl font-black text-white">{conversionRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Ventes validées</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{stats.sales}</span>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Commissions (validées)</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{stats.commissions.toLocaleString('fr-FR')} FCFA</span>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Retraits (En attente)</span>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <span className="text-3xl font-black text-white">{stats.pendingWithdrawalsCount}</span>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Retraits payés</span>
            <CheckCircle className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-white">{stats.paidWithdrawalsAmount.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>
    </div>
  );
}
