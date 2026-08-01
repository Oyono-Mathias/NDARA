const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useTracking')) {
    code = code.replace(
        "import { Sidebar } from './components/Sidebar';",
        "import { Sidebar } from './components/Sidebar';\nimport { useTracking } from './hooks/useTracking';"
    );
    
    code = code.replace(
        "function App() {",
        "function App() {\n  useTracking();"
    );
    fs.writeFileSync(file, code);
}
