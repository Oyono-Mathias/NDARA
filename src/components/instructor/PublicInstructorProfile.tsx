export function PublicInstructorProfile({ instructorId }: { instructorId: string }) {
    return (
        <div className="min-h-screen bg-slate-950 p-8 text-center text-white flex flex-col items-center justify-center font-sans">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-emerald-400">Expert: {instructorId}</h1>
            <p className="text-slate-400/80 font-medium">Le profil public de {instructorId} est en cours de développement sur Ndara Afrique.</p>
        </div>
    );
}
