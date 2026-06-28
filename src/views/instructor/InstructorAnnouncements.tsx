import { AnnouncementsClient } from "../../components/instructor/announcements/AnnouncementsClient";
import { TopAppBar } from "../../components/ui/TopAppBar";

export function InstructorAnnouncements() {
  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden font-sans">
      <TopAppBar title="ANNONCES" />
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <main className="flex-1 overflow-y-auto pb-32 px-4 mt-6 animate-in fade-in duration-700">
        <AnnouncementsClient />
      </main>
    </div>
  );
}
