import { Routes, Route, useNavigate } from "react-router-dom";
import { InstructorNavigation } from "../../components/InstructorNavigation";
import { Bell } from "lucide-react";
import { InstructorDashboard } from "./InstructorDashboard";
import { InstructorCourses } from "./InstructorCourses";
import { InstructorDevoirs } from "./InstructorDevoirs";
import { InstructorWealth } from "./InstructorWealth";

export function InstructorLayout() {
  return (
    <div className="antialiased min-h-screen flex bg-black">
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none z-0"></div>

      <InstructorNavigation />

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-full md:max-w-none pb-24 md:pb-0 h-screen overflow-y-auto hide-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-40 glass safe-top">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-amber-600 flex items-center justify-center text-background font-black text-sm shadow-[0_0_15px_rgba(204,119,34,0.3)]">
                E
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-white drop-shadow-md">EXPERT</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-white transition card-hover relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-card border border-white/10 overflow-hidden ring-2 ring-secondary/50 shadow-[0_0_10px_rgba(204,119,34,0.2)]">
                <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 md:px-8 py-24 md:py-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<InstructorDashboard />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="courses/create" element={<GenericPlaceholder title="Usine à Savoir" subtitle="Initialisation de cours avec Mathias IA" />} />
            <Route path="courses/edit/:id" element={<GenericPlaceholder title="Éditeur de Structure" subtitle="Drag-and-drop de modules, audit IA et ventes" />} />
            <Route path="quiz" element={<GenericPlaceholder title="Labo Évaluation" subtitle="Liste et gestion des quiz" />} />
            <Route path="quiz/:id" element={<GenericPlaceholder title="Éditeur de Quiz" subtitle="Création de questions et aide IA" />} />
            <Route path="devoirs" element={<InstructorDevoirs />} />
            <Route path="devoirs/:id" element={<GenericPlaceholder title="Correcteur Mathias IA" subtitle="Aide à la notation et feedback" />} />
            <Route path="students" element={<GenericPlaceholder title="Base de Données Ndara" subtitle="Liste des élèves et progression live" />} />
            <Route path="revenus" element={<InstructorWealth />} />
            <Route path="annonces" element={<GenericPlaceholder title="Radar Annonces" subtitle="Messages flash à la promotion" />} />
            <Route path="coupons" element={<GenericPlaceholder title="Growth Hub" subtitle="Création de codes promos" />} />
            <Route path="avis" element={<GenericPlaceholder title="Mur des Témoignages" subtitle="Modération des avis étoilés" />} />
            <Route path="certificats" element={<GenericPlaceholder title="Registre des Diplômes" subtitle="Historique des certificats décernés" />} />
            <Route path="settings" element={<GenericPlaceholder title="Réglages Academy" subtitle="Pilotage IA et notifications" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function GenericPlaceholder({ title, subtitle }: { title: string, subtitle?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
      <div className="w-24 h-24 rounded-full glass border border-secondary/30 flex items-center justify-center shadow-[0_0_30px_rgba(204,119,34,0.15)] relative">
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-secondary animate-spin"></div>
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="text-secondary font-serif font-black text-xl">N</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-primary text-sm font-bold uppercase tracking-wider">{subtitle}</p>}
      </div>
      <p className="text-gray-400 text-sm text-center max-w-md leading-relaxed">
        L'infrastructure souveraine de Ndara Afrique prépare cette interface expert. La synchronisation des noeuds blockchain est en cours.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="px-8 py-4 rounded-2xl bg-secondary text-background font-bold text-sm hover:bg-amber-600 transition-colors shadow-[0_0_20px_rgba(204,119,34,0.4)]"
      >
        Retour au Command Center
      </button>
    </div>
  );
}
