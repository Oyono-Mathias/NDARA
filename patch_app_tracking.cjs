const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { useTracking } from './hooks/useTracking';")) {
  code = code.replace("import { OfflineIndicator } from \"./components/ui/OfflineIndicator\";", "import { OfflineIndicator } from \"./components/ui/OfflineIndicator\";\nimport { useTracking } from './hooks/useTracking';");
  fs.writeFileSync('src/App.tsx', code);
}
