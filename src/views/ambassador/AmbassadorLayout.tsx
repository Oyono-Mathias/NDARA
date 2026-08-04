import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
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

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function checkAndInitAmbassador() {
      if (!firebaseUser) return;
      try {
        const ambRef = doc(db, 'ambassadors', firebaseUser.uid);
        const ambSnap = await getDoc(ambRef);
        
        if (!ambSnap.exists()) {
          const code = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          await setDoc(ambRef, {
            uid: firebaseUser.uid,
            referralCode: code,
            referralLink: `${window.location.origin}/register?ref=${code}`,
            activatedAt: serverTimestamp(),
            activatedBy: firebaseUser.uid,
            status: 'active',
            totalReferrals: 0,
            totalSales: 0,
            totalCommission: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Failed to init ambassador doc', err);
      } finally {
        setIsInitializing(false);
      }
    }
    checkAndInitAmbassador();
  }, [firebaseUser]);

  if (authLoading || roleLoading || isInitializing) {
    return (
      <div className="flex h-screen bg-[#0B0F19] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!firebaseUser || !currentUser) {
    return <Navigate to="/" replace />;
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
