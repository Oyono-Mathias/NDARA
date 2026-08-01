const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

const isAmbassadorRouteCode = `    const isInstructorRoute = location.pathname.startsWith('/instructor') && !location.pathname.startsWith('/instructor/p/');
    const isInstructorMode = isInstructorRoute || (location.pathname.startsWith('/instructor') && (currentUser?.role === 'expert' || currentUser?.role === 'instructor' || currentUser?.role === 'admin'));
    const isAmbassadorMode = location.pathname.startsWith('/ambassador');
`;
code = code.replace(
  /const isInstructorRoute[\s\S]*?const isInstructorMode[\s\S]*?;/,
  isAmbassadorRouteCode.trim()
);

// We need to inject the ambassador sidebar UI
const sidebarUI = `                {isAmbassadorMode ? (
                    <>
                        <div className="space-y-3">
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CHANGER DE MODE</p>
                            <button 
                                onClick={() => { navigate('/student/dashboard'); onClose(); }}
                                className="w-full h-12 rounded-2xl bg-white/5 flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition"
                            >
                                <ArrowLeftRight size={16} />
                                ÉTUDIANT
                            </button>
                        </div>
                        <div className="space-y-2">
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">• AMBASSADEUR</p>
                            <NavItem icon={LayoutGrid} label="DASHBOARD" to="/ambassador/dashboard" current={location.pathname} onClick={onClose} />
                        </div>
                    </>
                ) : isInstructorMode ? (`;
                
code = code.replace(
  /\{isInstructorMode \? \(/,
  sidebarUI
);

// Add "Espace Ambassadeur" link if the user has the 'ambassador' role, inside the student mode?
const addAmbassadorLink = `                                { (currentUser?.roles?.includes('instructor') || currentUser?.roles?.includes('expert') || currentUser?.role === 'instructor' || currentUser?.role === 'expert') && (
                                    <button 
                                        onClick={() => { navigate('/instructor/dashboard'); onClose(); }}
                                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center gap-3 text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
                                    >
                                        <ArrowLeftRight size={16} />
                                        MODE EXPERT
                                    </button>
                                )}
                                { (currentUser?.roles?.includes('ambassador') || currentUser?.role === 'ambassador') && (
                                    <button 
                                        onClick={() => { navigate('/ambassador/dashboard'); onClose(); }}
                                        className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-blue-500/20"
                                    >
                                        <ArrowLeftRight size={16} />
                                        MODE AMBASSADEUR
                                    </button>
                                )}`;

code = code.replace(
  /\{\s*\(currentUser\?\.roles\?\.includes\('instructor'\)[\s\S]*?MODE EXPERT\s*<\/button>\s*\)\}/,
  addAmbassadorLink.trim()
);

fs.writeFileSync(file, code);
console.log("Sidebar updated for ambassador");
