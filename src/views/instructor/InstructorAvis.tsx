import { AvisPageClient } from "../../components/instructor/avis/AvisPageClient";
import { TopAppBar } from "../../components/ui/TopAppBar";
import { Star } from "lucide-react";

export function InstructorAvis() {
  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden font-sans">
      <TopAppBar title="AVIS & NOTES" />
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <main className="flex-1 overflow-y-auto pb-32 px-4 mt-6 animate-in fade-in duration-700">
        <AvisPageClient />
      </main>
    </div>
  );
}
