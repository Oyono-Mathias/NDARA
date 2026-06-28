import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../context/RoleContext";
import { Star } from "lucide-react";
import { TouchArea } from "../../ui/TouchArea";

export function AvisPageClient() {
  const { currentUser } = useRole();
  const [avis, setAvis] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, "course_reviews"),
      where("instructorId", "==", currentUser.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      setAvis(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [currentUser?.uid]);

  return (
    <div className="space-y-4">
      {avis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 bg-[#1e293b] rounded-2xl border border-dashed border-white/10">
          <Star className="h-10 w-10 text-slate-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Aucun avis pour l'instant
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avis.map((review) => (
            <TouchArea
              as="div"
              key={review.id}
              className="p-6 bg-[#1e293b] border border-white/10 rounded-3xl relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {review.studentName || "Étudiant Anonyme"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {review.courseTitle}
                  </p>
                </div>
                <div className="flex bg-[#0f172a] border border-white/5 rounded-full px-2 py-1 gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic blockquote border-l-2 border-primary/50 pl-3">
                "{review.comment}"
              </p>
            </TouchArea>
          ))}
        </div>
      )}
    </div>
  );
}
