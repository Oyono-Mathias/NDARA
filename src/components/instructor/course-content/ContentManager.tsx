export function ContentManager({ courseId }: any) {
    return (
        <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-white">
            <h2 className="font-bold text-lg mb-2">Gestion du contenu</h2>
            <p className="text-sm text-slate-400">Le gestionnaire de modules et chapitres pour le cours {courseId}.</p>
        </div>
    );
}
