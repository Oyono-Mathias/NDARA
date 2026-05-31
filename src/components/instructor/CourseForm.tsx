export function CourseForm({ mode, initialData, onSubmit }: any) {
    return (
        <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-white">
            <h2 className="font-bold text-lg mb-4">{mode === 'create' ? 'Créer un cours' : 'Modifier le cours'}</h2>
            <p className="text-sm text-slate-400 mb-4">Ce formulaire est en cours de développement.</p>
            <button onClick={() => onSubmit({ title: 'Nouveau cours', status: 'Draft' })} className="px-4 py-2 bg-primary text-black font-bold uppercase rounded-xl text-xs">Simuler soumission</button>
        </div>
    );
}
