import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CertificatesService, CoursesService, UsersService } from '../services/db';
import { Certificate, Course, User } from '../types/models';
import { where } from 'firebase/firestore';
import { Loader2, ShieldCheck, XCircle, Award, Calendar, User as UserIcon, BookOpen } from 'lucide-react';

export function VerificationView() {
  const { certificateId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [student, setStudent] = useState<User | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!certificateId) return;
      
      const certs = await CertificatesService.getAll([where('certificateNumber', '==', certificateId)]);
      if (certs.length > 0) {
        const cert = certs[0];
        setCertificate(cert);
        
        const [cData, sData] = await Promise.all([
          CoursesService.getById(cert.courseId),
          UsersService.getById(cert.studentId)
        ]);
        
        setCourse(cData);
        setStudent(sData);
      }
      setLoading(false);
    };
    
    verify();
  }, [certificateId]);

  if (loading) {
    return <div className="min-h-screen bg-[#090E17] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#090E17] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden text-center">
        {!certificate ? (
          <>
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Certificat Invalide</h1>
            <p className="text-slate-400 mb-8">Le numéro de certificat <strong>{certificateId}</strong> ne correspond à aucun document officiel dans notre base de données.</p>
            <Link to="/" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors">
              Retour à l'accueil
            </Link>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <ShieldCheck className="w-48 h-48 text-emerald-500" />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Certificat Authentique</h1>
              <p className="text-emerald-400 font-mono text-sm mb-8">N° {certificate.certificateNumber}</p>
              
              <div className="space-y-4 text-left bg-black/50 p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex items-start gap-4">
                  <UserIcon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Délivré à</p>
                    <p className="text-white font-medium">{student?.firstName} {student?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <BookOpen className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Formation</p>
                    <p className="text-white font-medium leading-tight">{course?.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date de délivrance</p>
                    <p className="text-white font-medium">{new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <Link to="/" className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-colors block text-center">
                Découvrir nos formations
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
