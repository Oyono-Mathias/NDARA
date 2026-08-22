const fs = require('fs');

function addImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('ShieldCheck,') && content.includes('lucide-react')) {
    content = content.replace("from 'lucide-react';", ", ShieldCheck } from 'lucide-react';");
    content = content.replace("} , ShieldCheck", ", ShieldCheck");
  }
  fs.writeFileSync(file, content);
}

addImport('src/components/Sidebar.tsx');
addImport('src/views/ambassador/AmbassadorKyc.tsx');
addImport('src/views/ambassador/AmbassadorWallet.tsx');

