import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function LegalView() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLegalContent = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const settings = docSnap.data();
          setContent(settings.legal?.privacyPolicy || 'Contenu non disponible.');
        } else {
          setContent('Contenu non disponible.');
        }
      } catch (error) {
        console.error("Failed to fetch legal content:", error);
        setContent("Erreur lors du chargement du contenu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLegalContent();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="max-w-3xl mx-auto glass border border-white/5 rounded-3xl p-8 z-10 relative bg-[#111111]">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-8 border-b border-white/10 pb-4">Mentions Légales & Confidentialité</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
            <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded" />
          </div>
        ) : (
          <div 
            className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} 
          />
        )}
      </div>
    </div>
  );
}
