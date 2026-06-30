import { Link } from "react-router-dom";
import { DownloadCloud, Trash2, Video, Database } from "lucide-react";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import { TopAppBar } from "../components/ui/TopAppBar";

export default function OfflineDownloads() {
  const { downloads, totalSize, removeDownload } = useOfflineStorage();

  const handleRemove = async (videoId: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette vidéo du stockage de l'appareil ?")) {
      await removeDownload(videoId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 bg-slate-950 min-h-screen">
      <TopAppBar title="Téléchargements" showBack={true} transparent />

      <div className="px-4 space-y-8 pt-4 w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-white">Téléchargements</h1>
          <p className="text-slate-400 mt-2">Gérez vos vidéos accessibles sans connexion internet.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <DownloadCloud className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl mb-8">
         <Database className="w-5 h-5 text-slate-400" />
         <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Stockage utilisé par l'application</p>
            <p className="text-sm font-mono text-white mt-1">{totalSize}</p>
         </div>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Aucun téléchargement</h3>
            <p className="text-slate-400 mb-6">Vous n'avez pas encore téléchargé de vidéos.</p>
            <Link to="/student/courses" className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition">
                Parcourir mes formations
            </Link>
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {downloads.map((video) => (
            <div key={video.videoId} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition">
                         <Video className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white line-clamp-1">{video.lessonTitle}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{video.courseTitle}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Téléchargé le</p>
                        <p className="text-xs text-slate-300 font-mono">{new Date(video.downloadedAt).toLocaleDateString()}</p>
                    </div>
                    <button 
                        onClick={() => handleRemove(video.videoId)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
                        title="Supprimer du stockage"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
