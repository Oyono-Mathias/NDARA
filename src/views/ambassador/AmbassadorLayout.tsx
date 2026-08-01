import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from "../../context/RoleContext";
import { AmbassadorDashboard } from './AmbassadorDashboard';
import { AmbassadorReferrals } from './AmbassadorReferrals';
import { AmbassadorCommissions } from './AmbassadorCommissions';
import { AmbassadorWallet } from './AmbassadorWallet';
import { AmbassadorRewards } from './AmbassadorRewards';
import { AmbassadorLeaderboard } from './AmbassadorLeaderboard';
import { AmbassadorMarketing } from './AmbassadorMarketing';

import { Menu, Loader2 } from 'lucide-react';

export function AmbassadorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { firebaseUser, loading: authLoading } = useAuth();
  const { currentUser, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex h-screen bg-[#0B0F19] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!firebaseUser || !currentUser) {
    return <Navigate to="/" replace />;
  }

  const isAmbassador = currentUser.roles?.includes('ambassador') || currentUser.role === 'ambassador' || currentUser.role === 'admin';

  if (!isAmbassador) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0B0F19] text-white p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
        <p className="text-slate-400 mb-4">Vous n'avez pas le rôle Ambassadeur.</p>
        <button onClick={() => window.location.href = '/student/dashboard'} className="px-4 py-2 bg-blue-500 rounded-lg text-white font-bold">Retour</button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#0B0F19] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-slate-800/50 bg-[#0B0F19]/80 backdrop-blur-md z-20 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-widest text-slate-200">AMBASSADEUR</span>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar bg-[#090E17]">
          <div className="min-h-full">
            <Routes location={location}>
              <Route path="/" element={<AmbassadorDashboard />} />
              <Route path="dashboard" element={<AmbassadorDashboard />} />

              <Route path="referrals" element={<AmbassadorReferrals />} />
              <Route path="commissions" element={<AmbassadorCommissions />} />
              <Route path="wallet" element={<AmbassadorWallet />} />
              <Route path="rewards" element={<AmbassadorRewards />} />
              <Route path="leaderboard" element={<AmbassadorLeaderboard />} />
              <Route path="marketing" element={<AmbassadorMarketing />} />

              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
