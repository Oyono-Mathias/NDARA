import React, { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, XCircle, Loader2, Mail, DatabaseZap } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db } from "../../firebase";
import clsx from "clsx";

export function AdminInstructors() {
  const [pendingInstructors, setPendingInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // We listen to users with role 'instructor' or 'expert' and filter status on the client to avoid missing index errors
    const q = query(
      collection(db, "users"),
      where("role", "in", ["instructor", "expert"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((doc) => {
          const u = doc.data();
          // Fallback to "en_attente" or "active" just in case the SYNC wasn't fully processed or for older records
          if (u.status === "pending" || u.status === "en_attente" || u.status === "active" || u.isInstructorApproved === false) {
            data.push({ id: doc.id, ...u });
          }
        });
        setPendingInstructors(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching pending instructors:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  const handleSyncDatabases = async () => {
    if (!window.confirm("Lancer le script de migration de données des anciens formateurs ?")) return;
    
    setIsSyncing(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "in", ["instructor", "expert"])
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let needsUpdate = false;
        const updateData: any = {};
        
        if (data.isInstructorApproved === true || data.status === 'approved') {
          if (data.status !== 'approved') {
            updateData.status = 'approved';
            needsUpdate = true;
          }
        } else if (!data.status || data.status === 'en_attente' || data.status === 'active' || data.isInstructorApproved === false) {
          if (data.status !== 'pending') {
            updateData.status = 'pending';
            needsUpdate = true;
          }
        }
        
        if (data.isInstructorApproved !== undefined) {
          updateData.isInstructorApproved = deleteField();
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          batch.update(docSnap.ref, updateData);
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        alert(`Migration terminée : ${count} comptes mis à jour avec succès.`);
      } else {
        alert("Base de données déjà propre. Aucune migration requise.");
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert("Erreur critique lors de la migration des données.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <UserCheck className="text-[#10B981] w-6 h-6" /> VALIDATION_FORMATEURS
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSyncDatabases}
            disabled={isSyncing}
            className="flex items-center gap-2 text-xs font-bold bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 px-4 py-2 border border-blue-500/30 transition disabled:opacity-50"
            title="Nettoyer et mettre à jour les anciens comptes formateurs"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseZap className="w-4 h-4" />}
            SYSTEM_SYNC
          </button>
          <div className="text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1 border border-amber-500/30 h-[34px] flex items-center">
            {pendingInstructors.length} En Attente
          </div>
        </div>
      </div>

      {pendingInstructors.length === 0 ? (
        <div className="border border-white/10 p-10 flex flex-col items-center justify-center bg-[#050505] text-center">
          <UserCheck className="w-10 h-10 text-gray-600 mb-4" />
          <h3 className="text-white font-bold text-lg">
            Aucune demande en attente
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Tous les formateurs ont été traités.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingInstructors.map((instructor) => (
            <ApplicationRow key={instructor.id} instructor={instructor} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationRow({ instructor }: { instructor: any, key?: React.Key }) {
  const [isMutating, setIsMutating] = useState(false);

  const handleAction = async (action: "approved" | "rejected") => {
    if (isMutating) return;

    const confirmMessage =
      action === "approved"
        ? `Voulez-vous vraiment approuver ${instructor.name || instructor.email} ?`
        : `Voulez-vous vraiment rejeter la candidature de ${instructor.name || instructor.email} ?`;

    if (!window.confirm(confirmMessage)) return;

    setIsMutating(true);
    try {
      await updateDoc(doc(db, "users", instructor.id), {
        status: action,
      });
    } catch (error) {
      console.error("Error updating instructor status:", error);
      alert("Une erreur est survénue. Veuillez réessayer.");
      setIsMutating(false);
    }
    // No need to reset isMutating if successful, since the row will unmount automatically due to snapshot listener
  };

  return (
    <div className="bg-[#050505] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#10B981]/50 transition group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          {instructor.photoURL ? (
            <img
              src={instructor.photoURL}
              alt="Avatar"
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition"
            />
          ) : (
            <UserCheck className="w-5 h-5 text-gray-400 group-hover:text-[#10B981] transition" />
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">
            {instructor.name ||
              instructor.displayName ||
              "Utilisateur sans nom"}
          </h3>
          <p className="text-gray-500 text-xs flex items-center gap-2 mt-1 lowercase font-sans">
            <Mail className="w-3 h-3" /> {instructor.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0 w-full md:w-auto">
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => handleAction("rejected")}
            disabled={isMutating}
            className={clsx(
              "flex-1 md:flex-none p-3 border border-red-500/30 text-red-500 transition flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest",
              isMutating
                ? "opacity-50 cursor-not-allowed bg-red-500/5"
                : "hover:bg-red-500/10 hover:border-red-500/50",
            )}
            title="Rejeter"
          >
            {isMutating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="md:hidden">Rejeter</span>
          </button>
          <button
            onClick={() => handleAction("approved")}
            disabled={isMutating}
            className={clsx(
              "flex-1 md:flex-none py-3 px-6 border border-[#10B981]/30 text-[#10B981] transition flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest",
              isMutating
                ? "opacity-50 cursor-not-allowed bg-[#10B981]/5"
                : "hover:bg-[#10B981]/10 hover:border-[#10B981]/50 bg-[#10B981]/5",
            )}
          >
            {isMutating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            Approuver
          </button>
        </div>
      </div>
    </div>
  );
}
