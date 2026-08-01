import { useConfirm } from '../components/ui/ConfirmDialog';
import { Link, useNavigate } from "react-router-dom";
import { DownloadCloud, Trash2, Video, Database, Loader2, ChevronLeft } from "lucide-react";
import { useOfflineStorage } from "../hooks/useOfflineStorage";

export default function OfflineDownloads() {
  const confirm = useConfirm();

  const { downloads, totalSize, removeDownload, isLoading } = useOfflineStorage();
  const navigate = useNavigate();

  const handleRemove = async (videoId: string) => {
    if ((await confirm("Voulez-vous vraiment supprimer cette vidéo du stockage de l'appareil ?"))) {
      await removeDownload(videoId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-[#0B0F19] antialiased">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24 px-4 sm:px-6 pt-[env(safe-area-inset-top,16px)]">
        <div className="max-w-3xl mx-auto space-y-6 mt-4">
          
          <header className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
               <ChevronLeft className="w-5 h-5 text-white" />
             </button>
             <div className="flex-1 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Téléchargements</h1>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Hors-ligne (Offline-First)</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <DownloadCloud className="w-6 h-6 text-emerald-400" />
                </div>
             </div>
          </header>

          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
             <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0 border border-white/5">
                <Database className="w-5 h-5 text-slate-400" />
             </div>
             <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Espace de stockage local utilisé</p>
                <p className="text-sm font-black text-white mt-0.5">{totalSize}</p>
             </div>
          </div>

          {downloads.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Video className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">Aucun cours téléchargé.</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-6 max-w-xs mx-auto">
                    Cliquez sur l'icône de téléchargement dans vos leçons pour les rendre accessibles sans connexion internet.
                </p>
                <Link to="/student/courses" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500/10 text-emerald-400 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-colors active:scale-95">
                    Parcourir mes formations
                </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {downloads.map((video) => (
                <div key={video.videoId} className="flex items-center justify-between p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0B0F19] flex items-center justify-center shrink-0 border border-white/5">
                             <Video className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500/50" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-sm text-white line-clamp-1">{video.lessonTitle}</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1">{video.courseTitle}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2">
                        <div className="hidden sm:block text-right">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Sauvegardé le</p>
                            <p className="text-[11px] text-slate-300 font-bold">{new Date(video.downloadedAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <button 
                            onClick={() => handleRemove(video.videoId)}
                            className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-colors active:scale-95"
                            title="Supprimer du stockage"
                        >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

