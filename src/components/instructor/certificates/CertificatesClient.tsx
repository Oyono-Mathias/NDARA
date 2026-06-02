import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { Award, Search, Download } from 'lucide-react';

export function CertificatesClient() {
    const { currentUser } = useRole();
    const [certificates, setCertificates] = useState<any[]>([]);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(collection(db, 'certificates'), where('instructorId', '==', currentUser.uid));
        const unsub = onSnapshot(q, snap => {
            setCertificates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [currentUser?.uid]);

    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6">
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Registre des certificats</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Consultez et vérifiez les certificats délivrés à vos apprenants.</p>
            
            {certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 bg-[#0f172a] border border-dashed border-white/10 rounded-3xl">
                   <Award className="h-10 w-10 text-slate-500 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucun certificat délivré pour l'instant</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-[#0f172a] rounded-3xl border border-white/10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">Apprenant</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">Formation</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">Date d'émission</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 text-center">ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map(cert => (
                                <tr key={cert.id} className="hover:bg-white/5 transition border-b border-white/5 last:border-0 group cursor-pointer">
                                    <td className="p-4 font-bold text-white text-sm">{cert.studentName}</td>
                                    <td className="p-4 text-slate-300 text-xs">{cert.courseTitle}</td>
                                    <td className="p-4 text-slate-400 text-xs font-mono">{cert.issuedAt?.toDate().toLocaleDateString('fr-FR')}</td>
                                    <td className="p-4 text-center">
                                        <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md">{cert.id.slice(0, 8).toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
