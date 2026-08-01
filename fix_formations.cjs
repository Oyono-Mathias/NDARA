const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const formationsUIButtons = `
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Attribuer une formation" onClick={() => handleQuickAction('gift_course')} />
                <ActionButton icon={Minus} label="Retirer une formation" onClick={() => handleQuickAction('remove_course')} />
                <ActionButton icon={RefreshCw} label="Réinscrire" onClick={() => handleQuickAction('reenroll_course')} />
                <ActionButton icon={List} label="Réinitialiser progression" onClick={() => handleQuickAction('reset_progress')} />
                <ActionButton icon={CheckCircle2} label="Réinitialiser quiz" onClick={() => handleQuickAction('reset_quiz')} />
                <ActionButton icon={FileText} label="Réinitialiser devoirs" onClick={() => handleQuickAction('reset_assignments')} />
              </div>
`;

content = content.replace(
  /<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Formations \{member.role === 'instructor' \? 'Créées' : 'Achetées'\}<\/h3>/,
  `<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Formations {member.role === 'instructor' ? 'Créées' : 'Achetées'}</h3>` + formationsUIButtons
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
