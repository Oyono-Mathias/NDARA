"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, ShieldCheck, Activity, ChevronDown, Check,
  Briefcase, Ship, Wallet, Target, MessageSquare, 
  Sprout, Cpu, Scissors, Zap, Apple, Shield, 
  Calculator, Languages, Mic, FileText 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";

const iconMap: Record<string, any> = {
  Briefcase, Ship, Wallet, Target, MessageSquare, 
  Sprout, Cpu, Scissors, Zap, Apple, Shield, 
  Calculator, Languages, Mic, FileText
};

const sandboxesList = [
  // Économie & Entrepreneuriat
  { id: "business-plan", name: "Création d'Entreprise", category: "Comptabilité", icon: "Briefcase" },
  { id: "import-export", name: "Import-Export & Logistique", category: "Comptabilité", icon: "Ship" },
  { id: "mobile-money", name: "Mobile Money & Caisse", category: "Comptabilité", icon: "Wallet" },
  
  // Compétences Numériques
  { id: "marketing-digital", name: "Facebook Ads", category: "Marketing", icon: "Target" },
  { id: "whatsapp-business", name: "WhatsApp Closing", category: "Marketing", icon: "MessageSquare" },
  
  // Agriculture
  { id: "agriculture-climat", name: "Irrigation & Climat", category: "Agronomie", icon: "Sprout" },
  { id: "transformation-agri", name: "Transformation (Gari/Manioc)", category: "Agronomie", icon: "Cpu" },

  // Métiers manuels & Artisanat
  { id: "couture-wax", name: "Coupe de Tissu Wax", category: "Artisanat", icon: "Scissors" },
  { id: "electricite-base", name: "Électricité Domestique", category: "Artisanat", icon: "Zap" },

  // Santé & Bien-être
  { id: "nutrition-sante", name: "Nutrition Locale", category: "Santé", icon: "Apple" },
  { id: "prevention-sante", name: "Assainissement Concession", category: "Santé", icon: "Shield" },

  // Éducation & Langues
  { id: "labo-maths", name: "Mathématiques Pisciculture", category: "Éducation", icon: "Calculator" },
  { id: "langues-locales", name: "Négociation en Langue Locale", category: "Langues", icon: "Languages" },
  { id: "prise-parole", name: "Pitch Business (Public)", category: "Communication", icon: "Mic" },
  { id: "redaction-pro", name: "Facturation & RCCM", category: "Éducation", icon: "FileText" }
];

export default function SandboxPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const currentSandbox = sandboxesList.find(s => s.id === id);
  const title = currentSandbox ? currentSandbox.name : "Laboratoire Pratique";
  
  const [sandboxState, setSandboxState] = useState<"loading" | "ready" | "error">("loading");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      // Validate sandbox existence
      fetch(`/sandboxes/${id}.html`, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            setSandboxState("ready");
          } else {
            setSandboxState("error");
          }
        })
        .catch(() => {
          setSandboxState("error");
        });
    }
  }, [id]);

  // Group sandboxes by category for the menu
  const categories = Array.from(new Set(sandboxesList.map(s => s.category)));

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col overflow-hidden">
      {/* Header NavBar */}
      <header className="h-[80px] border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/student/dashboard')}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 text-left group hover:bg-white/5 p-1.5 -ml-1.5 rounded-xl transition-all"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-gray-100 group-hover:text-white transition-colors">
                    {title}
                  </h1>
                  <ChevronDown className={clsx("w-4 h-4 text-gray-500 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                   <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Environnement Isolé</span>
                </div>
              </div>
            </button>

            {/* Selection Menu (Dropdown) */}
            {isMenuOpen && (
              <div className="absolute top-14 left-0 w-80 sm:w-96 max-h-[70vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-4 duration-200 hide-scrollbar">
                <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">Catalogue des Laboratoires</h3>
                </div>
                
                <div className="p-2 space-y-4">
                  {categories.map(category => (
                    <div key={category}>
                      <div className="px-3 py-1.5">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{category}</span>
                      </div>
                      <div className="space-y-1">
                        {sandboxesList.filter(s => s.category === category).map(sandbox => {
                          const Icon = iconMap[sandbox.icon] || Briefcase;
                          const isActive = sandbox.id === id;
                          return (
                            <button
                              key={sandbox.id}
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push(`/student/sandbox/${sandbox.id}`);
                              }}
                              className={clsx(
                                "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                                isActive 
                                  ? "bg-[#10B981]/10 text-white" 
                                  : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={clsx(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                  isActive ? "bg-[#10B981]/20 text-[#10B981]" : "bg-white/5 text-gray-500"
                                )}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{sandbox.name}</span>
                              </div>
                              {isActive && <Check className="w-4 h-4 text-[#10B981]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] font-mono text-[#10B981] font-medium tracking-wide hidden sm:block">SÉCURISÉ</span>
        </div>
      </header>

      {/* IFrame Container: Isolation Area */}
      <main className="flex-1 w-full bg-[#000000] relative">
         {sandboxState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-[#10B981] animate-pulse" />
            </div>
         )}
         {sandboxState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <ShieldCheck className="w-12 h-12 text-[#ef4444] mb-4" />
                <h2 className="text-xl font-bold mb-2">Laboratoire Indisponible</h2>
                <p className="text-gray-400 max-w-sm">
                   Ce laboratoire est momentanément en maintenance ou n'existe pas. Veuillez revenir plus tard.
                </p>
                <button 
                  onClick={() => router.push('/student/dashboard')}
                  className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium border border-white/10"
                >
                  Retour au tableau de bord
                </button>
            </div>
         )}
         {sandboxState === "ready" && (
            <iframe 
               src={`/sandboxes/${id}.html`}
               sandbox="allow-scripts allow-forms allow-same-origin"
               className="w-full h-full border-none md:h-[calc(100vh-80px)] block"
               style={{ height: 'calc(100vh - 80px)' }}
               title={`Sandbox - ${title}`}
            />
         )}
      </main>
    </div>
  );
}
