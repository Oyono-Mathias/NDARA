import { Award, X } from "lucide-react";

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseName: string;
    studentName: string;
    instructorName: string;
    completionDate: Date;
    certificateId: string;
    courseId: string;
    userId: string;
}

export function CertificateModal({
    isOpen,
    onClose,
    courseName,
    studentName,
    instructorName,
    completionDate,
    certificateId
}: CertificateModalProps) {
    if (!isOpen) return null;

    const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-slate-800 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-8 bg-gradient-to-br from-amber-500/10 to-transparent">
                    {/* The Certificate Visual */}
                    <div className="w-full aspect-[1.414/1] bg-[#f8f9fa] rounded-2xl p-6 relative flex flex-col items-center justify-center text-center shadow-inner border-[8px] border-double border-amber-600/30 drop-shadow-md">
                        <div className="absolute top-4 left-4 w-10 h-10 md:w-12 md:h-12 rounded-full border border-amber-500/30 flex items-center justify-center opacity-50">
                            <span className="font-serif font-black text-amber-700 text-sm md:text-base">N</span>
                        </div>
                        
                        <p className="font-serif text-amber-800 text-[8px] md:text-[10px] tracking-widest uppercase mb-4">Certificat d'Achèvement</p>
                        <h3 className="font-serif text-xl md:text-2xl font-black text-gray-900 mb-2 leading-tight px-4">{courseName}</h3>
                        <p className="text-gray-500 text-[10px] md:text-xs italic mb-4">Décerné majestueusement à</p>
                        <p className="font-serif text-lg md:text-xl text-amber-700 font-bold border-b border-amber-700/30 pb-1 mb-6 px-4">{studentName || 'Étudiant(e)'}</p>
                        
                        <p className="text-gray-500 text-[8px] md:text-[10px] italic mb-6">Formateur : {instructorName}</p>

                        <div className="flex justify-between w-full px-2 text-gray-500 text-[6px] md:text-[8px] uppercase tracking-widest font-bold">
                            <span>Date: {formatter.format(completionDate)}</span>
                            <span>ID: {certificateId.substring(0, 12).toUpperCase()}</span>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 text-amber-500 opacity-50">
                            <Award className="w-8 h-8 md:w-12 md:h-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
