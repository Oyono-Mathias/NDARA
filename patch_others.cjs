const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');
code = code.replace("firebaseConfig.apiKey.includes('votre_cle_api_ici')", "(firebaseConfig.apiKey && firebaseConfig.apiKey.includes('votre_cle_api_ici'))");
fs.writeFileSync('src/firebase.ts', code);

let code2 = fs.readFileSync('src/views/ProfileRedirect.tsx', 'utf8');
code2 = code2.replace("role === 'admin' || role === 'super_admin'", "role === 'admin'");
fs.writeFileSync('src/views/ProfileRedirect.tsx', code2);

let code3 = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
code3 = code3.replace("import { Home, BookOpen, Wallet, User, Bell, Search, Menu, X, LogOut } from 'lucide-react';", "import { BookOpen, Wallet, User, Bell, Search, LogOut } from 'lucide-react';");
code3 = code3.replace("const { role } = useRole();\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);", "");
fs.writeFileSync('src/layouts/MainLayout.tsx', code3);
