const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

const switcherHtml = `
                        {/* EXPERT MODE */}
                        {role === 'admin' || role === 'instructor' ? (
                            <div className="space-y-3">
                                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CHANGER DE MODE</p>
                                <button 
                                    onClick={() => { navigate(role === 'admin' ? '/admin' : '/instructor'); onClose(); }}
                                    className="w-full h-12 rounded-2xl bg-white/5 flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition"
                                >
                                    <ArrowLeftRight size={16} />
                                    EXPERT
                                </button>
                            </div>
                        ) : null}
                        
                        {/* AMBASSADOR MODE */}
                        {currentUser?.roles?.includes('ambassador') || currentUser?.role === 'ambassador' || role === 'admin' ? (
                            <div className="space-y-3 mt-4">
                                <button 
                                    onClick={() => { navigate('/ambassador'); onClose(); }}
                                    className="w-full h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center gap-3 text-blue-400 font-bold text-xs uppercase tracking-widest hover:bg-blue-500/20 transition"
                                >
                                    <ArrowLeftRight size={16} />
                                    AMBASSADEUR
                                </button>
                            </div>
                        ) : null}
`;

code = code.replace(
    /\{\/\* EXPERT MODE \*\/\}[\s\S]*?\) : null\}/,
    switcherHtml.trim()
);

fs.writeFileSync(file, code);
