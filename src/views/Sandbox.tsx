import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Play, Save, FileCode2, Terminal, BookOpen, 
  ChevronLeft, Loader2, CheckCircle2, AlertTriangle
} from "lucide-react";
import { 
  doc, setDoc, getDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";
import { awardBadgeIfEligible, BADGE_REGISTRY, BadgeDefinition } from "../lib/badgeService";

type TabType = "instructions" | "editor" | "console";

interface SandboxTemplate {
  id: string;
  title: string;
  instructions: string;
  initialCode: string;
  expectedOutput?: string;
}

export function Sandbox() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template") || "default";
  const { currentUser } = useRole();

  const [activeTab, setActiveTab] = useState<TabType>("editor");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toast, setToast] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [awardedBadge, setAwardedBadge] = useState<BadgeDefinition | null>(null);

  const [title, setTitle] = useState("Sandbox Editor");
  const [instructions, setInstructions] = useState("Ceci est un environnement d'entraînement libre. \n\nÉcrivez votre code et exécutez-le !");
  const [codeContent, setCodeContent] = useState("// Écrivez votre code ici...\n");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadSandbox() {
      if (!currentUser?.uid) return;
      setIsLoading(true);
      try {
        // 1. Try to load user's saved work first
        const userSandboxRef = doc(db, "student_sandboxes", `${currentUser.uid}_${templateId}`);
        const userDoc = await getDoc(userSandboxRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setCodeContent(data.codeContent || "");
          if (data.status === 'completed') setIsCompleted(true);
          // Load template details
          await loadTemplateData();
        } else {
          // 2. Load template data
          await loadTemplateData();
        }
      } catch (err) {
        console.error("Erreur au chargement de la sandbox", err);
      } finally {
        setIsLoading(false);
      }
    }

    async function loadTemplateData() {
      if (templateId === "default") return;
      try {
        const templateRef = doc(db, "sandbox_templates", templateId);
        const templateDoc = await getDoc(templateRef);
        if (templateDoc.exists()) {
          const data = templateDoc.data() as SandboxTemplate;
          setTitle(data.title || "Exercice pratique");
          setInstructions(data.instructions || "");
          if (!codeContent || codeContent === "// Écrivez votre code ici...\n") {
            setCodeContent(data.initialCode || "");
          }
          if (data.expectedOutput) setExpectedOutput(data.expectedOutput);
        }
      } catch (e) {
        console.error("Erreur de récupération du template", e);
      }
    }

    loadSandbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, templateId]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    setToast(null);

    try {
      const sandboxRef = doc(db, "student_sandboxes", `${currentUser.uid}_${templateId}`);
      await setDoc(sandboxRef, {
        userId: currentUser.uid,
        templateId,
        codeContent,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setToast({ type: 'success', text: 'Code sauvegardé avec succès !' });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      setToast({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setActiveTab("console");
    setConsoleOutput(["[Système] Compilation en cours..."]);

    // Simulation de compilation / exécution pour l'instant
    setTimeout(() => {
      try {
        const outputLogs: string[] = [];
        // ATTENTION: Utiliser new Function est risqué en prod réelle, mais utile pour un Sandbox JS client simple.
        // Redéfinir console.log localement pour capturer la sortie.
        const originalLog = console.log;
        console.log = (...args) => {
          outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "));
        };
        
        // Execute the code safely
        const execute = new Function(codeContent);
        execute();

        console.log = originalLog; // Restore

        setConsoleOutput([
          "> Exécution terminée avec succès.",
          " ",
          ...outputLogs
        ]);
      } catch (err: any) {
        setConsoleOutput([
          "> Erreur d'exécution :",
          err.toString()
        ]);
      } finally {
        setIsCompiling(false);
      }
    }, 800);
  };

  const handleValidateCode = async () => {
    setIsValidating(true);
    setActiveTab("console");
    setConsoleOutput(["[Système] Évaluation des tests en cours..."]);

    setTimeout(async () => {
      let success = false;
      let returnedOutput = "";
      const outputLogs: string[] = [];
      
      try {
        const originalLog = console.log;
        console.log = (...args) => {
          outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "));
        };
        
        // Exécution sécurisée basique
        const execute = new Function(codeContent);
        execute();

        console.log = originalLog;

        returnedOutput = outputLogs.join("\n").trim();
        
        // Comparaison avec le résultat attendu
        if (!expectedOutput || expectedOutput.trim() === "" || returnedOutput.includes(expectedOutput.trim())) {
           success = true;
        }

        if (success) {
           setConsoleOutput([
             "> ✅ FÉLICITATIONS ! Ton code a passé les tests de validation.",
             " ",
             "--- Résultat obtenu ---",
             ...outputLogs
           ]);
           
           // Persistance de la réussite
           if (!isCompleted && currentUser?.uid) {
             try {
                const sandboxRef = doc(db, "student_sandboxes", `${currentUser.uid}_${templateId}`);
                await setDoc(sandboxRef, {
                  userId: currentUser.uid,
                  templateId,
                  codeContent,
                  status: 'completed',
                  updatedAt: serverTimestamp()
                }, { merge: true });
                
                setIsCompleted(true);
                setToast({ type: 'success', text: 'Exercice validé avec succès !' });

                // Attribution du badge réel Sandbox Wizard
                const badgeAssigned = await awardBadgeIfEligible(currentUser.uid, 'sandbox_wizard_1');
                if (badgeAssigned) {
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                  }
                  setAwardedBadge(BADGE_REGISTRY['sandbox_wizard_1']);
                }
             } catch(e) {
                console.error("Erreur de sauvegarde statut ou attribution badge", e);
             }
           }
        } else {
           setConsoleOutput([
             "> ❌ ÉCHEC DE LA VALIDATION",
             " ",
             "Ton code a fonctionné mais n'a pas retourné le résultat attendu.",
             " ",
             "--- Résultat obtenu ---",
             ...outputLogs,
             " ",
             "--- Résultat attendu ---",
             expectedOutput
           ]);
        }
      } catch (err: any) {
        setConsoleOutput([
          "> 💥 ERREUR D'EXÉCUTION :",
          err.toString(),
          " ",
          "Corrige ton code et réessaie."
        ]);
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms simulée
  };

  const insertCharacter = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = codeContent.substring(0, start) + char + codeContent.substring(end);
    
    setCodeContent(newCode);

    // Reset cursor position focus après la modification state
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Support de la touche Tab pour l'indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertCharacter('  ');
    }
  };

  // Quick action characters for mobile coding
  const quickChars = ['{', '}', '[', ']', '(', ')', '<', '>', '=', ';', '"', "'", '/'];

  return (
    <div className="flex flex-col min-h-screen bg-black relative animate-in fade-in">
      
      {/* Header */}
      <header className="shrink-0 bg-background/90 backdrop-blur-xl border-b border-white/10 pt-4 pb-3 px-4 sticky top-0 z-20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-black text-white leading-tight line-clamp-1">{title}</h1>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">ENVIRONNEMENT SÉCURISÉ</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
            <button
              onClick={handleRunCode}
              disabled={isCompiling || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm"
              title="Exécuter (sans validation)"
            >
              {isCompiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={handleValidateCode}
              disabled={isValidating || isLoading}
              className="px-3 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Valider</>}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl w-full max-w-sm mx-auto">
           <button 
             onClick={() => setActiveTab("instructions")}
             className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'instructions' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400'}`}
           >
             <BookOpen className="w-3.5 h-3.5" /> Guide
           </button>
           <button 
             onClick={() => setActiveTab("editor")}
             className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'editor' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400'}`}
           >
             <FileCode2 className="w-3.5 h-3.5" /> Éditeur
           </button>
           <button 
             onClick={() => setActiveTab("console")}
             className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'console' ? 'bg-white/10 text-emerald-400 shadow-sm' : 'text-slate-400'}`}
           >
             <Terminal className="w-3.5 h-3.5" /> Console
           </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
            <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {toast.text}
            </div>
         </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col z-10 w-full max-w-2xl mx-auto pb-safe">
        
        {isLoading ? (
          <div className="flex-1 p-6 space-y-4">
             <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse"></div>
             <div className="h-4 bg-white/5 rounded w-full animate-pulse mt-8"></div>
             <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
             <div className="h-4 bg-white/5 rounded w-4/6 animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* View: Instructions */}
            {activeTab === "instructions" && (
              <div className="flex-1 overflow-y-auto p-6 animate-in slide-in-from-right-2">
                <h2 className="text-xl font-serif text-white mb-6">Instructions</h2>
                <div className="prose prose-invert prose-emerald text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {instructions}
                </div>
              </div>
            )}

            {/* View: Editor */}
            {activeTab === "editor" && (
              <div className="flex-1 flex flex-col relative bg-[#090E17] animate-in slide-in-from-right-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full bg-transparent text-slate-300 font-mono text-[13px] p-4 focus:outline-none resize-none leading-relaxed border-none border-0 ring-0 selection:bg-emerald-500/30 hide-scrollbar"
                    placeholder="// Commencez à coder..."
                  />
                  {/* Line numbers fake gutter effect */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 border-r border-white/5 bg-black/20 flex flex-col items-center py-4 text-[10px] text-slate-600 font-mono select-none">
                    {codeContent.split('\n').map((_, i) => (
                      <div key={i} className="leading-relaxed min-h-[19.5px]">{(i + 1).toString()}</div>
                    ))}
                  </div>
                </div>

                {/* Quick actions bar for mobile coding */}
                <div className="bg-background border-t border-white/5 p-2 overflow-x-auto hide-scrollbar flex gap-2 w-full">
                  {quickChars.map((char, index) => (
                    <button
                      key={index}
                      onClick={() => insertCharacter(char)}
                      className="shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-mono text-sm hover:bg-white/10 active:scale-95 transition-all shadow-sm"
                    >
                      {char}
                    </button>
                  ))}
                  <button
                     onClick={() => insertCharacter('  ')}
                     className="shrink-0 px-4 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-mono text-xs hover:bg-white/10 active:scale-95 transition-all"
                  >
                     TAB
                  </button>
                </div>
              </div>
            )}

            {/* View: Console */}
            {activeTab === "console" && (
              <div className="flex-1 bg-[#0f172a] p-4 overflow-y-auto animate-in slide-in-from-right-2 border-t border-white/5">
                <div className="font-mono text-xs space-y-2">
                  {consoleOutput.length === 0 ? (
                    <div className="text-slate-500 italic">La sortie de la console apparaîtra ici.</div>
                  ) : (
                    consoleOutput.map((line, idx) => (
                      <div 
                        key={idx} 
                        className={`leading-relaxed break-words ${line.startsWith('>') ? 'text-slate-400' : line.includes('Erreur') ? 'text-rose-400' : 'text-emerald-300'}`}
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Célébration (Badge) */}
      {awardedBadge && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300" onClick={() => setAwardedBadge(null)}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/20 blur-[100px] rounded-full"></div>
          </div>
          
          <div 
            className="relative bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] border border-white/10 p-8 rounded-[32px] w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(16,185,129,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500 delay-150">
                 {awardedBadge.emoji}
              </div>
              <h2 className="text-2xl font-black text-white mb-2 leading-tight">Nouveau Badge Débloqué !</h2>
              <div className="text-emerald-400 font-bold mb-4 text-sm uppercase tracking-widest">{awardedBadge.title}</div>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                {awardedBadge.description}
              </p>
              
              <button 
                onClick={() => setAwardedBadge(null)}
                className="w-full py-4 rounded-2xl font-bold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] text-[15px]"
              >
                Continuer
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
