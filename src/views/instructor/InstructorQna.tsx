import { QnaClient } from "../../components/instructor/qna/QnaClient";
import { TopAppBar } from "../../components/ui/TopAppBar";

export function InstructorQna() {
  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden font-sans">
      <TopAppBar title="QUESTIONS & RÉPONSES" />
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <main className="flex-1 overflow-y-auto pb-32 px-4 mt-6 animate-in fade-in duration-700">
        <QnaClient />
      </main>
    </div>
  );
}
