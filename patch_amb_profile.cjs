const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorProfile.tsx', 'utf8');

const gamification = `
          <div className="col-span-2 md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-400" /> Détails Gamification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-800/50 rounded-xl">
                 <p className="text-sm font-medium text-slate-400">Badges obtenus</p>
                 <div className="flex flex-wrap gap-2 mt-2">
                   {(profile.badges || []).length > 0 ? profile.badges.map((b: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">{b.name || b}</span>
                   )) : <span className="text-sm text-slate-500">Aucun badge</span>}
                 </div>
               </div>
               <div className="p-4 bg-slate-800/50 rounded-xl">
                 <p className="text-sm font-medium text-slate-400">Challenges terminés</p>
                 <div className="flex flex-wrap gap-2 mt-2">
                   {(profile.challenges || []).length > 0 ? profile.challenges.map((c: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">{c.name || c}</span>
                   )) : <span className="text-sm text-slate-500">Aucun challenge</span>}
                 </div>
               </div>
            </div>
          </div>
`;

code = code.replace(
  "import { \n  ArrowLeft, User, Mail, MapPin, Calendar, Clock, \n  MousePointerClick, UserPlus, ShoppingCart, Wallet, \n  Trophy, Medal, ShieldAlert, MonitorSmartphone\n} from 'lucide-react';",
  "import { \n  ArrowLeft, User, Mail, MapPin, Calendar, Clock, \n  MousePointerClick, UserPlus, ShoppingCart, Wallet, \n  Trophy, Medal, ShieldAlert, MonitorSmartphone, Award\n} from 'lucide-react';"
);

// We'll insert it right before the end of the grid
code = code.replace(
  "        </div>\n      </div>\n    </div>",
  `${gamification}\n        </div>\n      </div>\n    </div>`
);

fs.writeFileSync('src/views/admin/AdminAmbassadorProfile.tsx', code);
