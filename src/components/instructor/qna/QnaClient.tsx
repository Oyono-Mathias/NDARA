import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../context/RoleContext";
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "../../ui/Skeleton";
import { TouchArea } from "../../ui/TouchArea";

export function QnaClient() {
  const { currentUser } = useRole();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Interactions state
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [loadingAnsweringId, setLoadingAnsweringId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!currentUser?.uid) return;
    setIsLoading(true);

    const q = query(
      collection(db, "course_qna"),
      where("instructorId", "==", currentUser.uid),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const qs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Tri local pour eviter l'erreur d'index composite manquant
      qs.sort((a: any, b: any) => {
        const dA = a.createdAt?.toMillis?.() || 0;
        const dB = b.createdAt?.toMillis?.() || 0;
        return dB - dA;
      });
      setQuestions(qs);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const handleSendAnswer = async (questionId: string) => {
    if (!answerText.trim() || !questionId) return;

    setLoadingAnsweringId(questionId);
    try {
      await updateDoc(doc(db, "course_qna", questionId), {
        answer: answerText,
        isAnswered: true,
        answeredAt: new Date(),
      });
      setAnswerText("");
      setAnsweringId(null);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      alert(
        "Erreur de réponse: " + (error.message || "Permissions insuffisantes."),
      );
    } finally {
      setLoadingAnsweringId(null);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-24 w-full rounded-2xl bg-[#1e293b] border border-white/5" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 bg-[#1e293b] rounded-2xl border border-dashed border-white/10">
          <MessageCircleQuestion className="h-10 w-10 text-slate-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Aucune question pour l'instant
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 bg-[#1e293b] border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {q.studentName || "Étudiant Anonyme"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {q.courseTitle}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${q.isAnswered ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                >
                  {q.isAnswered ? "Résolue" : "En attente"}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-4 bg-white/5 p-3 rounded-xl border-l-2 border-slate-500">
                {q.question}
              </p>

              {!q.isAnswered ? (
                answeringId === q.id ? (
                  <div className="flex gap-2 flex-col sm:flex-row animate-in fade-in-50">
                    <input
                      autoFocus
                      className="flex-1 h-12 bg-[#0f172a] border border-primary/30 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600"
                      placeholder="Tapez votre réponse en direct..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendAnswer(q.id)
                      }
                    />
                    <div className="flex gap-2">
                      <TouchArea
                        as="button"
                        onClick={() => handleSendAnswer(q.id)}
                        disabled={
                          !answerText.trim() || loadingAnsweringId === q.id
                        }
                        className="h-12 px-4 bg-primary text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition disabled:opacity-50 flex-1 sm:flex-none"
                      >
                        {loadingAnsweringId === q.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send size={16} /> Envoyer
                          </>
                        )}
                      </TouchArea>
                      <TouchArea
                        as="button"
                        onClick={() => {
                          setAnsweringId(null);
                          setAnswerText("");
                        }}
                        className="h-12 px-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition flex items-center justify-center"
                      >
                        Annuler
                      </TouchArea>
                    </div>
                  </div>
                ) : (
                  <TouchArea
                    as="button"
                    onClick={() => setAnsweringId(q.id)}
                    className="h-12 px-4 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-primary hover:text-emerald-400 flex items-center justify-center gap-2 w-full sm:w-auto transition"
                  >
                    <Send size={16} /> Répondre à l'étudiant
                  </TouchArea>
                )
              ) : q.needsValidation ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-black uppercase tracking-widest">
                        Généré par Mathias IA
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                        Nécessite validation
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{q.answer}</p>

                  {answeringId === q.id ? (
                    <div className="flex gap-2 flex-col sm:flex-row mt-3 animate-in fade-in-50">
                      <input
                        autoFocus
                        className="flex-1 h-12 bg-[#0f172a] border border-primary/30 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <TouchArea
                          as="button"
                          onClick={async () => {
                            setLoadingAnsweringId(q.id);
                            try {
                              await updateDoc(doc(db, "course_qna", q.id), {
                                answer: answerText,
                                needsValidation: false,
                                validatedByInstructor: true,
                              });
                              setAnsweringId(null);
                            } catch (e: any) {
                              console.error(e);
                              alert(
                                "Erreur de MAJ: " +
                                  (e.message || "Permissions insuffisantes"),
                              );
                            } finally {
                              setLoadingAnsweringId(null);
                            }
                          }}
                          disabled={
                            !answerText.trim() || loadingAnsweringId === q.id
                          }
                          className="h-12 px-4 bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center flex-1 sm:flex-none"
                        >
                          Mettre à jour
                        </TouchArea>
                        <TouchArea
                          as="button"
                          onClick={() => setAnsweringId(null)}
                          className="h-12 px-4 bg-slate-800 rounded-xl text-white flex items-center justify-center"
                        >
                          Annuler
                        </TouchArea>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-col sm:flex-row mt-2">
                      <TouchArea
                        as="button"
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, "course_qna", q.id), {
                              needsValidation: false,
                              validatedByInstructor: true,
                            });
                          } catch (e: any) {
                            console.error(e);
                            alert(
                              "Erreur de Validation: " +
                                (e.message || "Permissions insuffisantes"),
                            );
                          }
                        }}
                        className="h-12 px-4 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-500/30 transition flex items-center justify-center gap-2 flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Valider
                      </TouchArea>
                      <TouchArea
                        as="button"
                        onClick={() => {
                          setAnsweringId(q.id);
                          setAnswerText(q.answer);
                        }}
                        className="h-12 px-4 bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition flex items-center justify-center flex-1 sm:flex-none"
                      >
                        Modifier
                      </TouchArea>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">
                      {q.generatedBy === "MathiasIA" && q.validatedByInstructor
                        ? "Réponse IA Validée"
                        : "Votre réponse"}
                    </p>
                    <p className="text-sm text-slate-300">{q.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
