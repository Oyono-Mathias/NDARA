import { Routes, Route, useNavigate } from "react-router-dom";
import { AdminNavigation } from "../../components/AdminNavigation";
import { ShieldAlert, Terminal, Lock } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminStats } from "./AdminStats";
import { AdminMonitoring } from "./AdminMonitoring";
import { AdminUsers } from "./AdminUsers";
import { AdminInstructors } from "./AdminInstructors";
import { AdminModeration } from "./AdminModeration";
import { AdminCourses } from "./AdminCourses";
import { AdminCountries } from "./AdminCountries";
import { AdminPayouts } from "./AdminPayouts";
import { AdminPayments } from "./AdminPayments";
import { AdminMarketing } from "./AdminMarketing";
import { AdminSupport } from "./AdminSupport";
import { AdminCommsMonitor } from "./AdminCommsMonitor";
import { AdminFAQ } from "./AdminFAQ";
import { AdminNotifications } from "./AdminNotifications";
import { AdminCarousel } from "./AdminCarousel";
import { AdminSEO } from "./AdminSEO";
import { AdminSettings } from "./AdminSettings";
import { AdminRoles } from "./AdminRoles";

export function AdminLayout() {
  return (
    <div className="antialiased min-h-screen flex bg-[#050505] text-green-500 font-mono selection:bg-green-500/30 selection:text-green-200">
      
      {/* Matrix-like Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>

      <AdminNavigation />

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-full md:max-w-none pb-24 md:pb-0 h-screen overflow-y-auto hide-scrollbar scroll-smooth">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-40 bg-[#050505]/90 backdrop-blur-md border-b border-[#10B981]/20 safe-top">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-black border border-[#10B981] flex items-center justify-center text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-black text-[#10B981] tracking-widest text-base">SYS.ADMIN</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
                <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 md:px-8 py-24 md:py-8 w-full">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="statistiques" element={<AdminStats />} />
              <Route path="monitoring" element={<AdminMonitoring />} />
              <Route path="users" element={<AdminUsers />} />
              
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="countries" element={<AdminCountries />} />
              <Route path="payouts" element={<AdminPayouts />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="marketing" element={<AdminMarketing />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="support/:id" element={<GenericAdminPlaceholder title="Salle d'Arbitrage" subtitle="/sys/comms/support/ticket" />} />
              <Route path="messages" element={<AdminCommsMonitor />} />
              <Route path="faq" element={<AdminFAQ />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="roles" element={<AdminRoles />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function GenericAdminPlaceholder({ title, subtitle }: { title: string, subtitle: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="w-24 h-24 border border-[#10B981]/50 bg-[#10B981]/5 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
        <div className="absolute inset-0 border-t-2 border-r-2 border-[#10B981] animate-spin"></div>
        <Lock className="w-10 h-10 text-[#10B981]/50" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-[#10B981] text-xs font-bold tracking-[0.3em] uppercase">{subtitle}</p>
        <h2 className="text-2xl font-black text-white tracking-widest">{title}</h2>
      </div>
      <div className="w-full max-w-md bg-black border border-[#10B981]/30 p-4 rounded-sm">
          <p className="text-[#10B981]/70 text-sm font-mono leading-relaxed">
            {'>'} STATUS: ACCESS_GRANTED<br/>
            {'>'} LOADING_MODULE...<br/>
            {'>'} MODULE_INITIALIZATION_IN_PROGRESS<br/>
            <span className="text-white/50">{'>'} Veuillez patienter pendant le déchiffrement des données.</span>
          </p>
      </div>
      <button 
        onClick={() => navigate(-1)}
        className="px-8 py-3 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/50 font-bold text-sm hover:bg-[#10B981] hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] uppercase tracking-widest"
      >
        [ Return_To_Root ]
      </button>
    </div>
  );
}
