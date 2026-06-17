import React, { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, XCircle, Loader2, Mail, DatabaseZap, ShieldCheck, Search, Users } from "lucide-react";
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
import { NdaraSkeleton, EmptyState } from "./AdminSupport";

export function AdminInstructors() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "in", ["instructor", "pending_instructor"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setInstructors(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching instructors:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between items-center mb-6">
           <div className="h-10 w-full max-w-sm bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <NdaraSkeleton type="table" />
      </div>
    );
  }

  const filteredInstructors = instructors.filter((inst) => {
    const search = searchTerm.toLowerCase();
    const name = inst.name || inst.displayName || "";
    const email = inst.email || "";
    return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  const pendingCount = instructors.filter(i => i.role === "pending_instructor" || i.status === "pending").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      <header>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          Validation des Formateurs
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Gérez les demandes KYC et ajustez les taux de commission (Payouts).</p>
      </header>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un formateur..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-500/70"
          />
        </div>
        <div className="text-amber-500 text-xs font-black uppercase tracking-widest bg-amber-500/10 px-4 py-2 border border-amber-500/30 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {pendingCount} En Attente
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden mt-6">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/30">
                <th className="p-4 pl-6">Formateur</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Rôle / Statut</th>
                <th className="p-4">Commission</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30">
              {filteredInstructors.map((instructor) => (
                <ApplicationRow key={instructor.id} instructor={instructor} />
              ))}
            </tbody>
          </table>
          
          {filteredInstructors.length === 0 && (
             <div className="mt-6 p-4">
                <EmptyState title="Aucun membre" message="Aucun utilisateur ne correspond à ces critères ou la table est vide." icon={Users} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationRow({ instructor }: { instructor: any }) {
  const [isMutating, setIsMutating] = useState(false);

  const handleAction = async (action: "approved" | "rejected" | "revoke") => {
    if (isMutating) return;

    let confirmMessage = "";
    if (action === "approved") {
      confirmMessage = `Valider le KYC de ${instructor.name || instructor.email} ? Il obtiendra le statut instructeur avec un Payout Rate initial de 70%.`;
    } else if (action === "rejected") {
      confirmMessage = `Rejeter la demande de ${instructor.name || instructor.email} ? Son compte restera étudiant.`;
    } else {
      confirmMessage = `Révoquer les droits d'instructeur pour ${instructor.name || instructor.email} ?`;
    }

    if (!window.confirm(confirmMessage)) return;

    setIsMutating(true);
    try {
      if (action === "approved") {
        await updateDoc(doc(db, "users", instructor.id), {
          role: "instructor",
          status: "active",
          payoutRate: 0.7
        });
      } else if (action === "rejected" || action === "revoke") {
        await updateDoc(doc(db, "users", instructor.id), {
          role: "student",
          status: action === "rejected" ? "rejected" : "revoked"
        });
      }
    } catch (error) {
      console.error("Error updating instructor status:", error);
      alert("Une erreur est survénue. Veuillez réessayer.");
      setIsMutating(false);
    }
  };

  const isPending = instructor.role === "pending_instructor" || instructor.status === "pending";
  const isApproved = instructor.role === "instructor";

  return (
    <tr className="hover:bg-slate-800/50 transition-colors group">
      <td className="p-4 pl-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
            {instructor.photoURL || instructor.avatar ? (
              <img
                src={instructor.photoURL || instructor.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCheck className="w-5 h-5 text-emerald-500/50" />
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight line-clamp-1">
              {instructor.name || instructor.displayName || "Utilisateur Anonyme"}
            </h3>
            <p className="text-slate-500 text-[10px] font-mono tracking-widest mt-0.5">
              ID: {instructor.id.substring(0, 8)}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="text-slate-400 text-xs font-medium flex items-center gap-2">
           <Mail className="w-3.5 h-3.5" />
           {instructor.email || "Non renseigné"}
        </span>
      </td>
      <td className="p-4">
         <span className={clsx(
           "inline-flex items-center justify-center text-[9px] font-black px-2.5 py-1 rounded border uppercase tracking-widest",
           isApproved ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse"
         )}>
           {isApproved ? "Instructeur" : "KYC Attente"}
         </span>
      </td>
      <td className="p-4">
        <span className="text-white font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
           {instructor.payoutRate ? `${(instructor.payoutRate * 100).toFixed(0)}%` : "N/A"}
        </span>
      </td>
      <td className="p-4 pr-6 text-right">
        <div className="flex items-center justify-end gap-2">
          {isPending && (
            <>
              <button
                onClick={() => handleAction("rejected")}
                disabled={isMutating}
                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center border border-red-500/20 disabled:opacity-50"
                title="Rejeter le KYC"
              >
                {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleAction("approved")}
                disabled={isMutating}
                className="flex items-center gap-2 px-3 h-8 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Valider
              </button>
            </>
          )}
          {isApproved && (
            <button
               onClick={() => handleAction("revoke")}
               disabled={isMutating}
               className="px-3 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center border border-slate-700 text-[10px] font-black uppercase tracking-widest"
            >
              Révoquer
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

