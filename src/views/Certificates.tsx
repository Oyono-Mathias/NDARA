// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { CertificatesService, CoursesService } from '../services/db';
import { Certificate, Course } from '../types/models';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Award, Loader2, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CertificateModal } from '../components/modals/certificate-modal';

export function CertificatesView() {
  const { firebaseUser } = useAuth();
  const [certificates, setCertificates] = useState<(Certificate & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCert, setSelectedCert] = useState<(Certificate & { course?: Course }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    if (!firebaseUser) return;
    
    const fetchCertificates = async () => {
      const certs = await CertificatesService.getAll([where('studentId', '==', firebaseUser.uid), orderBy('issuedAt', 'desc')]);
      
      const enrichedCerts = await Promise.all(
        certs.map(async (cert) => {
          const course = await CoursesService.getById(cert.courseId);
          return { ...cert, course: course || undefined };
        })
      );
      
      setCertificates(enrichedCerts);
      setLoading(false);
    };

    fetchCertificates();
  }, [firebaseUser]);

  if (loading) {
    return <div className="min-h-screen bg-[#0B0F19] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-6 rounded-3xl space-y-2 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">Mes Certificats</h1>
        <p className="text-slate-400 text-sm">Vos accomplissements et diplômes</p>
      </div>

      {selectedCert && (
        <CertificateModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            courseName={selectedCert.course?.title || ''}
            studentName={firebaseUser?.displayName || 'Étudiant'}
            instructorName="Ndara Academy"
            completionDate={new Date(selectedCert.issuedAt)}
            certificateId={selectedCert.certificateNumber}
            courseId={selectedCert.courseId}
            userId={selectedCert.studentId}
        />
      )}

      {certificates.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <Award className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun certificat</h3>
          <p className="text-slate-400 mb-6">Terminez une formation à 100% pour obtenir votre premier certificat.</p>
          <Link to="/student/catalog" className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl">
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="w-32 h-32 text-emerald-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest mb-4">
                  <ShieldCheck className="w-4 h-4" /> Certificat Officiel
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                  {cert.course?.title || 'Formation Inconnue'}
                </h3>
                
                <div className="text-sm text-slate-400 mb-8 space-y-1">
                  <p>Délivré le : {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</p>
                  <p className="font-mono text-xs">N° {cert.certificateNumber}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => { setSelectedCert(cert); setIsModalOpen(true); }} className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                  <Link to={`/verify/${cert.certificateNumber}`} className="px-4 py-3 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
