const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTracker = "import { ReferralTracker } from './components/ReferralTracker';";
if (!code.includes('ReferralTracker')) {
  code = code.replace("import { Toaster }", `${importTracker}\nimport { Toaster }`);
  code = code.replace("<Router>", "<Router>\n      <ReferralTracker />");
  fs.writeFileSync('src/App.tsx', code);
}
