import { Cpu, Server, Activity, Database, Zap } from "lucide-react";

export function AdminMonitoring() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-8">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Cpu className="text-[#10B981] w-6 h-6" /> SYS_MONITORING
        </h1>
         <div className="flex items-center gap-2 text-[#10B981] bg-[#10B981]/10 px-3 py-1 border border-[#10B981]/30">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#10B981]/20 bg-[#050505] p-1">
          <MonitorCard title="Mathias IA Engine" value="Healthy" detail="Latence: 120ms" icon={Zap} status="ok" />
          <MonitorCard title="Firestore DB Load" value="45%" detail="Read/Write: 850/s" icon={Database} status="warning" />
          <MonitorCard title="R2 Video Stream" value="99.9%" detail="Bande passante: 2.4 GB/s" icon={Server} status="ok" />
      </div>

       <div className="bg-[#050505] border border-[#10B981]/20 p-6 mt-8">
          <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10B981]" /> Console Logs (Genkit / Gemini)
          </h2>
          <div className="bg-black border border-white/10 p-4 font-mono text-xs space-y-2 h-64 overflow-y-auto">
              <LogLine time="18:42:10" level="INFO" msg="Model gemini-1.5-flash initialized context." />
              <LogLine time="18:42:12" level="INFO" msg="Tutor Mathias answering query from user UID_892." />
              <LogLine time="18:42:15" level="WARN" msg="API Rate limit approaching threshold (85%)." color="text-amber-500" />
              <LogLine time="18:42:18" level="INFO" msg="Video encoding job #492 finished payload." />
              <LogLine time="18:42:20" level="ERROR" msg="Failed to parse Webhook from Flutterwave." color="text-red-500" />
               <LogLine time="18:42:21" level="INFO" msg="Attempting Webhook retry (1/3)." />
          </div>
       </div>
    </div>
  );
}

function MonitorCard({ title, value, detail, icon: Icon, status }: any) {
    const statusColor = status === 'ok' ? 'text-[#10B981]' : status === 'warning' ? 'text-amber-500' : 'text-red-500';
    const statusBg = status === 'ok' ? 'bg-[#10B981]/10' : status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10';

    return (
        <div className={`p-4 ${statusBg} flex items-center gap-4`}>
             <div className={`w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 ${statusColor.replace('text', 'border')}`}>
                 <Icon className={`w-6 h-6 ${statusColor}`} />
             </div>
             <div>
                 <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
                 <p className={`text-lg font-black tracking-wider ${statusColor}`}>{value}</p>
                 <p className="text-gray-500 text-[10px] uppercase tracking-wider">{detail}</p>
             </div>
        </div>
    )
}

function LogLine({ time, level, msg, color = "text-gray-400" }: any) {
    const levelColor = level === 'INFO' ? 'text-blue-400' : level === 'WARN' ? 'text-amber-500' : 'text-red-500';
    return (
        <div className="flex gap-4">
            <span className="text-gray-600 shrink-0">[{time}]</span>
            <span className={`${levelColor} shrink-0 w-12`}>{level}</span>
            <span className={color}>{msg}</span>
        </div>
    )
}
