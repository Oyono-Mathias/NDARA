import { ResourcesClient } from '../../components/instructor/resources/ResourcesClient';

export function InstructorResources() {
  return (
    <div className="flex flex-col gap-0 pb-24 min-h-screen bg-transparent font-sans -m-4 md:-m-8 p-4 md:p-8 relative">
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />
      
      <header className="z-10 bg-[#0f172a]/95 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/5 animate-in fade-in duration-700">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Ressources</h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">Partagez des fichiers, des liens et d'autres ressources avec vos étudiants.</p>
      </header>
      
      <div className="w-full animate-in fade-in duration-700 delay-150">
          <ResourcesClient />
      </div>
    </div>
  );
}
