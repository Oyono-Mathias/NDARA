import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Target, Download, Link as LinkIcon, Share2, Plus, BarChart3, QrCode, FileText, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { CSVLink } from "react-csv";

export function AmbassadorMarketing() {
  const { firebaseUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'assets' | 'links' | 'generator' | 'campaigns'>('assets');
  
  // States
  const [assets, setAssets] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generator State
  const [genCourse, setGenCourse] = useState('');
  const [genNetwork, setGenNetwork] = useState('Facebook');
  const [genLanguage, setGenLanguage] = useState('Français');
  const [generatedPost, setGeneratedPost] = useState('');

  const ambassadorCode = userProfile?.ambassadorCode || `AMB-${firebaseUser?.uid.substring(0,6).toUpperCase()}`;
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (firebaseUser) loadData();
  }, [firebaseUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aSnap, cSnap, campSnap] = await Promise.all([
        getDocs(query(collection(db, 'marketing_assets'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'courses'), where('isPublished', '==', true))),
        getDocs(query(collection(db, 'ambassador_campaigns'), where('ambassadorId', '==', firebaseUser!.uid), orderBy('createdAt', 'desc')))
      ]);
      setAssets(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCampaigns(campSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const handleDownloadAsset = (url: string, title: string) => {
    // In a real app, you might route this through a backend proxy to increment downloads and force download headers.
    // For now, we open in new tab.
    window.open(url, '_blank');
    toast.success('Ouverture de la ressource...');
  };

  const handleDownloadQR = (format: 'png' | 'svg' | 'pdf', courseId: string) => {
    const canvas = document.getElementById(`qr-${courseId}`) as HTMLCanvasElement;
    if (!canvas && format === 'png') return toast.error('Erreur QR Code');
    
    if (format === 'png' && canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Code_${courseId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      toast.success('Le téléchargement SVG/PDF est généré (mock)');
    }
  };

  const generatePost = () => {
    if (!genCourse) return toast.error('Veuillez sélectionner une formation');
    const course = courses.find(c => c.id === genCourse);
    const link = `${baseUrl}/course/${course.id}?ref=${ambassadorCode}`;
    
    const templates: Record<string, string[]> = {
      Facebook: [
        `🚀 Découvrez ${course.title} sur NDARA !\n\nEnvie de booster vos compétences ? J'ai testé et je recommande à 100%.\n\n👉 Inscrivez-vous via mon lien pour en profiter :\n${link}\n\n#Apprentissage #NDARA #${course.title.replace(/\s+/g, '')} #Formation`,
      ],
      LinkedIn: [
        `Je suis ravi(e) de partager avec mon réseau cette excellente formation : ${course.title} sur NDARA.\n\nIdéal pour développer de nouvelles compétences professionnelles. 📈\n\nDécouvrez le programme ici :\n${link}\n\n#DéveloppementPersonnel #NDARA #FormationPro`
      ],
      Twitter: [
        `Apprenez ${course.title} sur @NDARA ! 🔥\nSuper contenu, foncez : ${link}\n#EdTech #NDARA`
      ]
    };
    
    const posts = templates[genNetwork] || templates['Facebook'];
    setGeneratedPost(posts[0]);
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const name = target.name.value;
    const courseId = target.course.value;
    
    if(!name) return toast.error("Nom requis");
    
    try {
      const campData = {
        name,
        courseId,
        ambassadorId: firebaseUser!.uid,
        clicks: 0,
        signups: 0,
        sales: 0,
        revenue: 0,
        commissions: 0,
        createdAt: new Date(),
        status: 'active'
      };
      await addDoc(collection(db, 'ambassador_campaigns'), campData);
      toast.success('Campagne créée');
      target.reset();
      loadData();
    } catch(e) {
      toast.error('Erreur lors de la création');
    }
  };

  const shareLink = (network: string, link: string, title: string) => {
    const encodedLink = encodeURIComponent(link);
    const encodedTitle = encodeURIComponent(title);
    let url = '';
    
    switch (network) {
      case 'whatsapp': url = `https://wa.me/?text=${encodedTitle}%20${encodedLink}`; break;
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${encodedTitle}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`; break;
      case 'telegram': url = `https://t.me/share/url?url=${encodedLink}&text=${encodedTitle}`; break;
      case 'email': url = `mailto:?subject=${encodedTitle}&body=${encodedLink}`; break;
    }
    
    if (url) window.open(url, '_blank');
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Target className="text-blue-500 w-8 h-8" />
          Centre Marketing
        </h1>
        <p className="text-slate-400">Outils et ressources pour promouvoir NDARA et booster vos ventes.</p>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-slate-800 pb-2">
        <button onClick={() => setActiveTab('assets')} className={`px-6 py-3 font-bold text-sm rounded-xl whitespace-nowrap transition-colors ${activeTab === 'assets' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Bibliothèque de Médias</button>
        <button onClick={() => setActiveTab('links')} className={`px-6 py-3 font-bold text-sm rounded-xl whitespace-nowrap transition-colors ${activeTab === 'links' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Liens & QR Codes</button>
        <button onClick={() => setActiveTab('generator')} className={`px-6 py-3 font-bold text-sm rounded-xl whitespace-nowrap transition-colors ${activeTab === 'generator' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Générateur de Posts</button>
        <button onClick={() => setActiveTab('campaigns')} className={`px-6 py-3 font-bold text-sm rounded-xl whitespace-nowrap transition-colors ${activeTab === 'campaigns' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Mes Campagnes</button>
      </div>

      {/* ASSETS */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map(a => (
            <div key={a.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col">
              <div className="h-40 bg-slate-900 flex items-center justify-center p-2 relative group">
                 {a.category === 'banner' || a.category === 'social' || a.category === 'logo' ? (
                   <img src={a.thumbnail || a.url} alt={a.title} className="max-w-full max-h-full object-contain" />
                 ) : (
                   <FileText className="w-12 h-12 text-slate-700" />
                 )}
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button onClick={() => handleDownloadAsset(a.url, a.title)} className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition" title="Télécharger">
                      <Download className="w-5 h-5" />
                    </button>
                 </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-1">{a.title}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{a.category} • {a.size || 'N/A'}</p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                   <span className="text-slate-400">{a.downloads || 0} vues</span>
                   <button onClick={() => handleDownloadAsset(a.url, a.title)} className="text-blue-400 font-bold hover:text-blue-300">Télécharger</button>
                </div>
              </div>
            </div>
          ))}
          {assets.length === 0 && <div className="col-span-full p-12 text-center text-slate-500">Aucune ressource marketing disponible.</div>}
        </div>
      )}

      {/* LINKS */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Lien Global (Boutique)</h2>
            <p className="text-sm text-slate-400 mb-4">Ce lien redirige vers l'accueil ou le catalogue avec votre cookie de parrainage.</p>
            <div className="flex gap-2">
              <input type="text" readOnly value={`${baseUrl}/catalog?ref=${ambassadorCode}`} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-sm" />
              <button onClick={() => handleCopy(`${baseUrl}/catalog?ref=${ambassadorCode}`)} className="px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2">
                <Copy className="w-4 h-4" /> Copier
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Liens par Formation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => {
              const link = `${baseUrl}/course/${c.id}?ref=${ambassadorCode}`;
              return (
                <div key={c.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                  <h3 className="font-bold text-white mb-4 line-clamp-1">{c.title}</h3>
                  <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
                     <QRCodeCanvas id={`qr-${c.id}`} value={link} size={150} level="H" />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => handleDownloadQR('png', c.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PNG</button>
                    <button onClick={() => handleDownloadQR('pdf', c.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PDF</button>
                  </div>
                  <div className="mt-auto border-t border-slate-800 pt-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Partager</p>
                    <div className="flex gap-2 justify-between">
                       <button onClick={() => handleCopy(link)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Copier"><Copy className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('whatsapp', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-green-400 hover:text-green-300" title="WhatsApp"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('facebook', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-blue-500 hover:text-blue-400" title="Facebook"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('twitter', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-sky-400 hover:text-sky-300" title="Twitter/X"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('linkedin', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-blue-600 hover:text-blue-500" title="LinkedIn"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Générateur de publication</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Formation à promouvoir</label>
                <select value={genCourse} onChange={e => setGenCourse(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                  <option value="">Sélectionnez une formation</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Réseau Social</label>
                <select value={genNetwork} onChange={e => setGenNetwork(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                  <option value="Facebook">Facebook / Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">X (Twitter)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Langue</label>
                <select value={genLanguage} onChange={e => setGenLanguage(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                  <option value="Français">Français</option>
                  <option value="Anglais">Anglais</option>
                </select>
              </div>
              <button onClick={generatePost} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-xl transition shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                Générer le texte
              </button>
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Résultat</h2>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm whitespace-pre-wrap font-mono min-h-[200px]">
              {generatedPost || "Sélectionnez vos options et cliquez sur Générer pour obtenir un texte prêt à publier avec votre lien d'ambassadeur."}
            </div>
            {generatedPost && (
              <button onClick={() => handleCopy(generatedPost)} className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
                <Copy className="w-5 h-5" /> Copier le texte
              </button>
            )}
          </div>
        </div>
      )}

      {/* CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-8">
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Créer une Campagne Suivie</h2>
            <form onSubmit={createCampaign} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nom de la campagne</label>
                <input name="name" type="text" placeholder="Ex: Promo Noël 2024" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Formation associée</label>
                <select name="course" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                  <option value="all">Tout le catalogue</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <button type="submit" className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-[50px]">
                Créer et Obtenir le lien
              </button>
            </form>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Performances</h2>
              <div className="flex gap-2">
                <CSVLink data={campaigns} filename="ndara_campagnes.csv" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2"><Download className="w-4 h-4"/> CSV / Excel</CSVLink>
                <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2"><FileText className="w-4 h-4"/> PDF / Imprimer</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Campagne</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lien</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Clics</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Inscrits</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Ventes</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Commissions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Aucune campagne créée.</td>
                    </tr>
                  ) : (
                    campaigns.map(c => {
                      const link = `${baseUrl}${c.courseId !== 'all' ? `/course/${c.courseId}` : '/catalog'}?ref=${ambassadorCode}&camp=${c.id}`;
                      const cvr = c.clicks > 0 ? Math.round((c.sales / c.clicks) * 100) : 0;
                      return (
                        <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="p-4">
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase">Conv: {cvr}%</p>
                          </td>
                          <td className="p-4">
                             <button onClick={() => handleCopy(link)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 flex items-center gap-1">
                               Copier <Copy className="w-3 h-3" />
                             </button>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-300">{c.clicks || 0}</td>
                          <td className="p-4 text-center font-bold text-blue-400">{c.signups || 0}</td>
                          <td className="p-4 text-center font-bold text-emerald-400">{c.sales || 0}</td>
                          <td className="p-4 text-right font-black text-emerald-400">
                             {(c.commissions || 0).toLocaleString()} XAF
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
