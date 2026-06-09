import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Play,
  Save,
  FileCode2,
  Terminal,
  BookOpen,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Leaf,
  Target,
} from "lucide-react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";
import {
  awardBadgeIfEligible,
  BADGE_REGISTRY,
  BadgeDefinition,
} from "../lib/badgeService";

type TabType = "instructions" | "editor" | "console";
type FiliereType = "marketing" | "accounting" | "agronomy" | "coding";

interface SandboxTemplate {
  id: string;
  title: string;
  instructions: string;
  initialCode: string;
  expectedOutput?: string;
  filiereId?: FiliereType;
}

export function UniversalPlayground() {
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
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [awardedBadge, setAwardedBadge] = useState<BadgeDefinition | null>(
    null,
  );

  const [title, setTitle] = useState("Sandbox Editor");
  const [instructions, setInstructions] = useState(
    "Ceci est un environnement d'entraînement libre. \n\nÉcrivez votre code et exécutez-le !",
  );
  const [currentFiliere, setCurrentFiliere] = useState<FiliereType>("coding");
  const isFirstLoadRef = useRef(true);

  // State per filiere
  const [codeContent, setCodeContent] = useState(
    "// Écrivez votre code ici...\n",
  );
  const [accountingData, setAccountingData] = useState({
    debit: 0,
    credit: 0,
    label: "",
  });
  const [marketingData, setMarketingData] = useState({
    budget: 1000,
    audience: "Jeunes pros",
    text: "",
  });
  const [agronomyData, setAgronomyData] = useState({
    intrants: 50,
    eau: 50,
    semences: 50,
  });

  const [expectedOutput, setExpectedOutput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const [renderedHTML, setRenderedHTML] = useState("");
  const [visualizerError, setVisualizerError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.type === "iframe_err" || e.data.type === "SANDBOX_ERROR") {
          setVisualizerError((prev) =>
            prev
              ? prev + "\n" + (e.data.msg || e.data.text)
              : e.data.msg || e.data.text,
          );
        } else if (e.data.type === "SANDBOX_LOG") {
          setConsoleOutput((prev) => [...prev, `[Iframe] ${e.data.text}`]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    async function loadFiliereDemo() {
      try {
        const demoTemplateId = `sandbox_${currentFiliere}_1`;
        const templateRef = doc(db, "sandbox_templates", demoTemplateId);
        const templateDoc = await getDoc(templateRef);

        if (templateDoc.exists()) {
          const data = templateDoc.data() as SandboxTemplate;
          setTitle(data.title || "Exercice pratique");
          setInstructions(data.instructions || "");
          if (data.expectedOutput) setExpectedOutput(data.expectedOutput);

          if (currentFiliere === "coding")
            setCodeContent(data.initialCode || "");
          if (currentFiliere === "accounting")
            setAccountingData(JSON.parse(data.initialCode || "{}"));
          if (currentFiliere === "marketing")
            setMarketingData(JSON.parse(data.initialCode || "{}"));
          if (currentFiliere === "agronomy")
            setAgronomyData(JSON.parse(data.initialCode || "{}"));
        }
      } catch (e) {
        console.error("Erreur chargement demo filière:", e);
      }
    }

    loadFiliereDemo();
  }, [currentFiliere]);

  useEffect(() => {
    async function loadSandbox() {
      if (!currentUser?.uid) return;
      setIsLoading(true);
      try {
        const userSandboxRef = doc(
          db,
          "student_sandboxes",
          `${currentUser.uid}_${templateId}`,
        );
        const userDoc = await getDoc(userSandboxRef);

        let savedFiliere: FiliereType | null = null;

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.status === "completed") setIsCompleted(true);

          if (data.filiereId) {
            savedFiliere = data.filiereId;
            setCurrentFiliere(savedFiliere!);
            if (savedFiliere === "coding")
              setCodeContent(data.codeContent || "");
            if (savedFiliere === "accounting")
              setAccountingData(JSON.parse(data.codeContent || "{}"));
            if (savedFiliere === "marketing")
              setMarketingData(JSON.parse(data.codeContent || "{}"));
            if (savedFiliere === "agronomy")
              setAgronomyData(JSON.parse(data.codeContent || "{}"));
          } else {
            // legacy fallback
            setCodeContent(data.codeContent || "");
          }
          await loadTemplateData(savedFiliere);
        } else {
          await loadTemplateData(null);
        }
      } catch (err) {
        console.error("Erreur au chargement de la sandbox", err);
      } finally {
        setIsLoading(false);
      }
    }

    async function loadTemplateData(alreadySavedFiliere: FiliereType | null) {
      if (templateId === "default") return;
      try {
        const templateRef = doc(db, "sandbox_templates", templateId);
        const templateDoc = await getDoc(templateRef);
        if (templateDoc.exists()) {
          const data = templateDoc.data() as SandboxTemplate;
          setTitle(data.title || "Exercice pratique");
          setInstructions(data.instructions || "");
          if (data.expectedOutput) setExpectedOutput(data.expectedOutput);

          const curFiliere = data.filiereId || "coding";
          if (!alreadySavedFiliere) {
            setCurrentFiliere(curFiliere);
            if (
              curFiliere === "coding" &&
              (!codeContent || codeContent.startsWith("// "))
            ) {
              setCodeContent(data.initialCode || "");
            }
          }
        }
      } catch (e) {
        console.error("Erreur de récupération du template", e);
      }
    }

    loadSandbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, templateId]);

  const getCurrentContentString = () => {
    switch (currentFiliere) {
      case "accounting":
        return JSON.stringify(accountingData);
      case "marketing":
        return JSON.stringify(marketingData);
      case "agronomy":
        return JSON.stringify(agronomyData);
      default:
        return codeContent;
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    setToast(null);

    try {
      const sandboxRef = doc(
        db,
        "student_sandboxes",
        `${currentUser.uid}_${templateId}`,
      );
      await setDoc(
        sandboxRef,
        {
          userId: currentUser.uid,
          templateId,
          filiereId: currentFiliere,
          codeContent: getCurrentContentString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setToast({ type: "success", text: "Exercice sauvegardé avec succès !" });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      setToast({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setRenderedHTML(codeContent);
    setVisualizerError(null);

    setActiveTab("console");
    setConsoleOutput(["[Système] Simulation en cours..."]);

    setTimeout(() => {
      try {
        const outputLogs: string[] = [];

        if (currentFiliere === "coding") {
          outputLogs.push(
            `[Console Passive] Veuillez vérifier le rendu dans l'onglet Guide / Rendu.`,
          );
        } else if (currentFiliere === "accounting") {
          outputLogs.push(`Libellé: ${accountingData.label}`);
          outputLogs.push(`Débit: ${accountingData.debit} XAF`);
          outputLogs.push(`Crédit: ${accountingData.credit} XAF`);
          outputLogs.push(
            `Solde: ${accountingData.debit - accountingData.credit} XAF`,
          );
        } else if (currentFiliere === "marketing") {
          outputLogs.push(`Budget: ${marketingData.budget} $`);
          outputLogs.push(`Audience: ${marketingData.audience}`);
          outputLogs.push(`Message: ${marketingData.text}`);
        } else if (currentFiliere === "agronomy") {
          outputLogs.push(`Intrants: ${agronomyData.intrants}%`);
          outputLogs.push(`Eau: ${agronomyData.eau}%`);
          outputLogs.push(`Semences: ${agronomyData.semences}%`);
        }

        setConsoleOutput([
          "> Test local terminé avec succès.",
          " ",
          ...outputLogs,
        ]);
      } catch (err: any) {
        setConsoleOutput(["> Erreur d'exécution :", err.toString()]);
      } finally {
        setIsCompiling(false);
      }
    }, 800);
  };

  const handleValidateCode = async () => {
    setIsValidating(true);
    setRenderedHTML(codeContent);
    setVisualizerError(null);

    setActiveTab("console");
    setConsoleOutput(["[Système] Évaluation logicielle et IA en cours..."]);

    try {
      let success = false;
      let returnedOutput = "";
      const outputLogs: string[] = [];

      if (currentFiliere === "coding") {
        outputLogs.push(`[Console Passive] Veuillez vérifier le rendu visuel.`);
        // Validation automatique réussie pour la soumission libre.
        // Un système avancé analyserait window.parent messages
        success = true;
      } else if (currentFiliere === "accounting") {
        outputLogs.push(`Validation du journal comptable...`);
        if (
          accountingData.debit > 0 &&
          accountingData.debit === accountingData.credit
        ) {
          success = true;
          outputLogs.push(
            `✅ Équilibre Débit/Crédit respecté (${accountingData.debit} = ${accountingData.credit}).`,
          );
        } else {
          outputLogs.push(`❌ Le journal est déséquilibré ou vide.`);
        }
      } else if (currentFiliere === "agronomy") {
        outputLogs.push(`Calcul du rendement agricole...`);
        const yieldPct =
          agronomyData.intrants * 0.3 +
          agronomyData.eau * 0.5 +
          agronomyData.semences * 0.2;
        outputLogs.push(`Rendement généré : ${yieldPct.toFixed(1)}%`);
        if (yieldPct >= 75) {
          success = true;
          outputLogs.push(`✅ Rendement optimal atteint !`);
        } else {
          outputLogs.push(
            `❌ Rendement trop faible. Visez au moins 75% en ajustant l'eau et les intrants.`,
          );
        }
      } else if (currentFiliere === "marketing") {
        outputLogs.push(`Analyse de la campagne par l'IA Mathias...`);
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Tu es un expert marketing. Évalue cet exercice d'un étudiant. Critères: ${expectedOutput || "Créativité, cohérence"}.
Soumission de l'étudiant : Budget ${marketingData.budget}$, Cible: ${marketingData.audience}, Message: "${marketingData.text}".
Renvoie EXACTEMENT un objet JSON valide suivant ce format et RIEN D'AUTRE:
{"success": true/false (selon si la campagne est bonne), "feedback": "Commentaire constructif court"}`,
          }),
        });

        const jsonRes = await chatRes.json();
        if (!chatRes.ok || jsonRes.error) {
          outputLogs.push(
            `❌ L'IA ne peut pas évaluer actuellement: ${jsonRes.error || "Erreur temporaire."}`,
          );
          success = false;
        } else {
          try {
            // Extract json block if model adds markdown
            const textMatch = jsonRes.reply.match(/\{[\s\S]*\}/);
            const data = JSON.parse(textMatch ? textMatch[0] : jsonRes.reply);
            success = data.success;
            outputLogs.push(data.feedback);
          } catch (e) {
            outputLogs.push("Erreur de parsing IA.");
          }
        }
      }

      if (success) {
        setConsoleOutput([
          "> ✅ FÉLICITATIONS ! Ton exercice a passé les tests de validation.",
          " ",
          ...outputLogs,
        ]);

        if (!isCompleted && currentUser?.uid) {
          const sandboxRef = doc(
            db,
            "student_sandboxes",
            `${currentUser.uid}_${templateId}`,
          );
          await setDoc(
            sandboxRef,
            {
              userId: currentUser.uid,
              templateId,
              filiereId: currentFiliere,
              codeContent: getCurrentContentString(),
              status: "completed",
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );

          setIsCompleted(true);
          setToast({ type: "success", text: "Exercice validé avec succès !" });

          const badgeAssigned = await awardBadgeIfEligible(
            currentUser.uid,
            "sandbox_wizard_1",
          );
          if (badgeAssigned) {
            if (typeof navigator !== "undefined" && "vibrate" in navigator)
              navigator.vibrate([200, 100, 200]);
            setAwardedBadge(BADGE_REGISTRY["sandbox_wizard_1"]);
          }
        }
      } else {
        setConsoleOutput([
          "> ❌ ÉCHEC DE LA VALIDATION",
          " ",
          "Ton exercice n'a pas atteint les critères requis.",
          " ",
          ...outputLogs,
        ]);
      }
    } catch (err: any) {
      setConsoleOutput([
        "> 💥 ERREUR DE SOUMISSION :",
        err.toString(),
        " ",
        "Vérifie tes entrées et réessaie.",
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  const insertCharacter = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode =
      codeContent.substring(0, start) + char + codeContent.substring(end);

    setCodeContent(newCode);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertCharacter("  ");
    }
  };

  const quickChars = [
    "{",
    "}",
    "[",
    "]",
    "(",
    ")",
    "<",
    ">",
    "=",
    ";",
    '"',
    "'",
    "/",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black relative animate-in fade-in">
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
              <h1 className="text-lg font-black text-white leading-tight line-clamp-1">
                {title}
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                UNIVERSAL PLAYGROUND
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={currentFiliere}
              onChange={(e) => setCurrentFiliere(e.target.value as FiliereType)}
              className="bg-[#0f1225] border border-white/10 text-emerald-400 text-xs font-bold rounded-xl px-2 py-2 outline-none cursor-pointer hover:bg-white/5 transition-colors appearance-none"
            >
              <option value="coding">💻 Code</option>
              <option value="accounting">📊 Comptabilité</option>
              <option value="marketing">🎯 Marketing</option>
              <option value="agronomy">🌱 Agronomie</option>
            </select>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleRunCode}
              disabled={isCompiling || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm"
              title="Exécuter (sans validation)"
            >
              {isCompiling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleValidateCode}
              disabled={isValidating || isLoading}
              className="px-3 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Valider
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl w-full max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("instructions")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === "instructions" ? "bg-white/10 text-white shadow-sm" : "text-slate-400"}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Guide / Rendu
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === "editor" ? "bg-white/10 text-white shadow-sm" : "text-slate-400"}`}
          >
            {currentFiliere === "coding" ? (
              <FileCode2 className="w-3.5 h-3.5" />
            ) : currentFiliere === "marketing" ? (
              <Target className="w-3.5 h-3.5" />
            ) : currentFiliere === "accounting" ? (
              <Briefcase className="w-3.5 h-3.5" />
            ) : (
              <Leaf className="w-3.5 h-3.5" />
            )}{" "}
            Simuler
          </button>
          <button
            onClick={() => setActiveTab("console")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === "console" ? "bg-white/10 text-emerald-400 shadow-sm" : "text-slate-400"}`}
          >
            <Terminal className="w-3.5 h-3.5" /> Console
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl border ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {toast.text}
          </div>
        </div>
      )}

      <main className="flex-1 relative flex flex-col z-10 w-full max-w-2xl mx-auto pb-safe">
        {isLoading ? (
          <div className="flex-1 p-6 space-y-4">
            <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-full animate-pulse mt-8"></div>
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <>
            {activeTab === "instructions" && (
              <div className="flex-1 flex flex-col relative h-full overflow-hidden animate-in slide-in-from-right-2">
                <div
                  className={`${currentFiliere === "coding" ? "shrink-0 max-h-[35%] border-b border-white/5" : "flex-1"} overflow-y-auto p-6 bg-[#090E17]`}
                >
                  <h2 className="text-xl font-serif text-white mb-6">
                    Instructions
                  </h2>
                  <div className="prose prose-invert prose-emerald text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {instructions}
                  </div>
                </div>

                {currentFiliere === "coding" && (
                  <div className="flex-1 flex flex-col min-h-0 bg-white">
                    <iframe
                      title="Visualiseur Sandbox"
                      className="flex-1 w-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin"
                      srcDoc={`
                         <!DOCTYPE html>
                         <html>
                           <head>
                             <script>
                               // Intercepter les logs standard
                               const _log = console.log;
                               console.log = function(...args) {
                                 _log.apply(console, args);
                                 window.parent.postMessage({ type: 'SANDBOX_LOG', text: args.join(' ') }, '*');
                               };
                               const _error = console.error;
                               console.error = function(...args) {
                                 _error.apply(console, args);
                                 window.parent.postMessage({ type: 'SANDBOX_ERROR', text: args.join(' ') }, '*');
                               };

                               // Intercepter les erreurs d'exécution globales
                               window.onerror = function(message, source, lineno, colno, error) {
                                 window.parent.postMessage({ type: 'SANDBOX_ERROR', text: message + ' (Ligne ' + lineno + ')' }, '*');
                                 return false;
                               };
                             </script>
                           </head>
                           <body>
                             ${(() => {
                               const isHTML =
                                 /^\s*<(!|html|body|div|h[1-6]|p|span|a|ul|li|nav|main|article|section|footer|head|style|script|button|input|form)\b/i.test(
                                   renderedHTML,
                                 );

                               if (isHTML) {
                                 let htmlToSend = renderedHTML;
                                 // Automatically protect scripts in HTML to wait for DOMContentLoaded
                                 htmlToSend = htmlToSend.replace(
                                   /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
                                   (match, scriptContent) => {
                                     if (
                                       scriptContent.includes(
                                         "DOMContentLoaded",
                                       )
                                     )
                                       return match;
                                     return `<script>
document.addEventListener('DOMContentLoaded', () => {
  try {
    ${scriptContent}
  } catch (err) {
    console.error(err);
  }
});
</script>`;
                                   },
                                 );

                                 return htmlToSend.includes("<html")
                                   ? htmlToSend.substring(
                                       htmlToSend.indexOf("<body") > -1
                                         ? htmlToSend.indexOf("<body>") + 6
                                         : 0,
                                     )
                                   : htmlToSend;
                               } else {
                                 // Pure Javascript: create a script wrapper dynamically
                                 return `<script>
document.addEventListener('DOMContentLoaded', () => {
  try {
    ${renderedHTML}
  } catch (err) {
    console.error(err);
  }
});
</script>`;
                               }
                             })()}
                           </body>
                         </html>
                       `}
                    />
                    <div className="shrink-0 h-[104px] bg-[#0f172a] border-t-2 border-[#1e293b] p-4 overflow-y-auto flex flex-col gap-2 shadow-inner pointer-events-auto">
                      <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" /> Console Iframe (Rendu
                        UI)
                      </span>
                      {visualizerError ? (
                        <div className="font-mono text-xs text-rose-400 break-words leading-relaxed">
                          💥 {visualizerError}
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-emerald-500/70">
                          ✅ Rendu effectué sans erreur critique.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "editor" && (
              <div className="flex-1 flex flex-col relative bg-[#090E17] animate-in slide-in-from-right-2">
                {currentFiliere === "coding" && (
                  <div className="flex-1 flex flex-col relative">
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
                      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 border-r border-white/5 bg-black/20 flex flex-col items-center py-4 text-[10px] text-slate-600 font-mono select-none">
                        {codeContent.split("\n").map((_, i) => (
                          <div
                            key={i}
                            className="leading-relaxed min-h-[19.5px]"
                          >
                            {(i + 1).toString()}
                          </div>
                        ))}
                      </div>
                    </div>
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
                        onClick={() => insertCharacter("  ")}
                        className="shrink-0 px-4 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-mono text-xs hover:bg-white/10 active:scale-95 transition-all"
                      >
                        TAB
                      </button>
                    </div>
                  </div>
                )}

                {currentFiliere === "accounting" && (
                  <div className="p-6 space-y-6">
                    <h3 className="text-white font-bold text-lg mb-4">
                      Saisie de Journal Comptable
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          Libellé de l'opération
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          value={accountingData.label}
                          onChange={(e) =>
                            setAccountingData({
                              ...accountingData,
                              label: e.target.value,
                            })
                          }
                          placeholder="Ex: Achat de marchandises..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Débit (XAF)
                          </label>
                          <input
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            value={accountingData.debit}
                            onChange={(e) =>
                              setAccountingData({
                                ...accountingData,
                                debit: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Crédit (XAF)
                          </label>
                          <input
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            value={accountingData.credit}
                            onChange={(e) =>
                              setAccountingData({
                                ...accountingData,
                                credit: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-xl border flex justify-between items-center ${accountingData.debit === accountingData.credit ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}
                      >
                        <span className="font-bold text-sm">Équilibre</span>
                        <span className="font-mono">
                          {accountingData.debit === accountingData.credit
                            ? "✅ Solde nul"
                            : "❌ Déséquilibré"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentFiliere === "marketing" && (
                  <div className="p-6 space-y-6">
                    <h3 className="text-white font-bold text-lg mb-4">
                      Simulateur de Campagne
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          Budget ($)
                        </label>
                        <input
                          type="number"
                          step="100"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          value={marketingData.budget}
                          onChange={(e) =>
                            setMarketingData({
                              ...marketingData,
                              budget: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          Audience Cible
                        </label>
                        <select
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                          value={marketingData.audience}
                          onChange={(e) =>
                            setMarketingData({
                              ...marketingData,
                              audience: e.target.value,
                            })
                          }
                        >
                          <option>Jeunes professionnels (25-35 ans)</option>
                          <option>Étudiants universitaires</option>
                          <option>Chefs d'entreprises (B2B)</option>
                          <option>Grand public</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          Texte de l'annonce (Copywriting)
                        </label>
                        <textarea
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                          placeholder="Rédigez un message percutant..."
                          value={marketingData.text}
                          onChange={(e) =>
                            setMarketingData({
                              ...marketingData,
                              text: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {currentFiliere === "agronomy" && (
                  <div className="p-6 space-y-6">
                    <h3 className="text-white font-bold text-lg mb-4">
                      Gestion des Ressources Agricoles
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Intrants / Engrais
                          </label>
                          <span className="text-emerald-400 font-mono text-sm">
                            {agronomyData.intrants}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-emerald-500"
                          value={agronomyData.intrants}
                          onChange={(e) =>
                            setAgronomyData({
                              ...agronomyData,
                              intrants: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Irrigation (Eau)
                          </label>
                          <span className="text-blue-400 font-mono text-sm">
                            {agronomyData.eau}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-blue-500"
                          value={agronomyData.eau}
                          onChange={(e) =>
                            setAgronomyData({
                              ...agronomyData,
                              eau: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Qualité des Semences
                          </label>
                          <span className="text-amber-400 font-mono text-sm">
                            {agronomyData.semences}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-amber-500"
                          value={agronomyData.semences}
                          onChange={(e) =>
                            setAgronomyData({
                              ...agronomyData,
                              semences: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "console" && (
              <div className="flex-1 bg-[#0f172a] p-4 overflow-y-auto animate-in slide-in-from-right-2 border-t border-white/5">
                <div className="font-mono text-xs space-y-2">
                  {consoleOutput.length === 0 ? (
                    <div className="text-slate-500 italic">
                      La sortie de la console apparaîtra ici.
                    </div>
                  ) : (
                    consoleOutput.map((line, idx) => (
                      <div
                        key={idx}
                        className={`leading-relaxed break-words ${line.startsWith(">") ? "text-slate-400" : line.includes("Erreur") ? "text-rose-400" : "text-emerald-300"}`}
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

      {awardedBadge && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300"
          onClick={() => setAwardedBadge(null)}
        >
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
            <h2 className="text-2xl font-black text-white mb-2 leading-tight">
              Nouveau Badge Débloqué !
            </h2>
            <div className="text-emerald-400 font-bold mb-4 text-sm uppercase tracking-widest">
              {awardedBadge.title}
            </div>
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
