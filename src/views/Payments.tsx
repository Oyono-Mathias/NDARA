import { ArrowDownRight, Smartphone, Server } from "lucide-react";

export function PaymentsView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl text-white">Journal Flux</h1>
      </div>

       <div className="glass rounded-3xl p-6 border border-white/5 mb-8">
            <h3 className="font-serif text-xl text-white mb-6">Notes comptables</h3>
            <div className="space-y-4">
                {[
                    { type: 'depot', amount: '25,000 XAF', via: 'Orange Money', date: 'Aujourd\'hui', bg: 'bg-orange-500' },
                    { type: 'achat', amount: '-25,000 XAF', via: 'Course: Trading', date: 'Aujourd\'hui', bg: 'bg-white/10' },
                    { type: 'depot', amount: '10,000 XAF', via: 'MTN Mobile Money', date: 'Hier', bg: 'bg-yellow-500', color: 'text-black' },
                    { type: 'retrait', amount: '-15,000 XAF', via: 'Wave', date: 'Il y a 3 jours', bg: 'bg-blue-400' },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${item.bg} ${item.color || 'text-white'}`}>
                                {item.via.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">{item.type.toUpperCase()}</p>
                                <p className="text-gray-500 text-xs">{item.via}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`text-sm font-bold ${item.amount.startsWith('-') ? 'text-white' : 'text-primary'}`}>{item.amount}</p>
                             <p className="text-gray-500 text-xs">{item.date}</p>
                        </div>
                    </div>
                ))}
            </div>
      </div>
    </div>
  );
}
