const fs = require('fs');
let content = fs.readFileSync('src/views/instructor/InstructorLayout.tsx', 'utf8');

if (!content.includes('useAuth')) {
    content = content.replace('import { useRole }', "import { useAuth } from '../../contexts/AuthContext';\nimport { useRole }");
}

const target = `  if (!currentUser) return <Navigate to="/auth" replace />;`;

const replacement = `  const { firebaseUser } = useAuth();
  if (!currentUser) {
    if (firebaseUser) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4 text-center">
                <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
                <p className="text-slate-400 mb-4">Impossible de charger votre profil instructeur.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#10B981] rounded-lg text-black font-bold">Réessayer</button>
            </div>
        );
    }
    return <Navigate to="/auth" replace />;
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/instructor/InstructorLayout.tsx', content);
console.log("Patched InstructorLayout");
