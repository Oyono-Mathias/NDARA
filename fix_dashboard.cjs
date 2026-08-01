const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorDashboard.tsx', 'utf8');

// Add hasError state
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);/,
  'const [isLoading, setIsLoading] = useState(true);\n  const [hasError, setHasError] = useState(false);'
);

// Catch block in fetchAnalytics
code = code.replace(
  /      } catch \(error\) \{\n        console\.error\("Dashboard Analytics Fetch Error:", error\);\n      \}/,
  '      } catch (error) {\n        console.error("Dashboard Analytics Fetch Error:", error);\n        if (isMounted) setHasError(true);\n      } finally {\n        if (isMounted) setIsLoading(false);\n      }'
);

// Add fallback UI
code = code.replace(
  /  if \(isUserLoading \|\| isLoading\) \{/,
  `  if (hasError) {
    return (
      <div className="flex flex-col h-full bg-[#0f172a]">
        <TopAppBar title="COCKPIT" />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-slate-400">
          <ClipboardCheck className="h-16 w-16 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p>Impossible de charger les données du tableau de bord.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-primary text-black font-bold rounded-full">Réessayer</button>
        </div>
      </div>
    );
  }

  if (isUserLoading || isLoading) {`
);

fs.writeFileSync('src/views/instructor/InstructorDashboard.tsx', code);
