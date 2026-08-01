const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const oldTabs = `  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'formations', label: 'Formations', icon: BookOpen },
    { id: 'quizzes', label: 'Quiz & Devoirs', icon: Award },
    { id: 'certificats', label: 'Certificats', icon: FileText },
    { id: 'wallet', label: 'Paiements & Wallet', icon: Wallet },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    { id: 'permissions', label: 'Permissions', icon: ToggleRight },
    { id: 'activity', label: 'Historique Complet', icon: Activity },
    { id: 'security', label: 'Sécurité', icon: ShieldCheck },
    { id: 'admin', label: 'Administration', icon: UserCog },
    { id: 'logs', label: 'Journal', icon: History }
  ];`;

const newTabs = `  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'formations', label: 'Formations', icon: BookOpen },
    { id: 'quizzes', label: 'Quiz & Devoirs', icon: Award },
    { id: 'certificats', label: 'Certificats', icon: FileText },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'license', label: 'Licence Formateur', icon: BookOpen },
    { id: 'market', label: 'Marketplace', icon: Wallet },
    { id: 'p2p', label: 'Marché P2P', icon: Wallet },
    { id: 'permissions', label: 'Permissions', icon: ToggleRight },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    { id: 'activity', label: 'Historique', icon: Activity },
    { id: 'security', label: 'Sécurité', icon: ShieldCheck },
    { id: 'admin', label: 'Admin', icon: UserCog },
    { id: 'logs', label: 'Audit', icon: History }
  ];`;

content = content.replace(oldTabs, newTabs);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
