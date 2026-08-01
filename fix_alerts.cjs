const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && f !== 'ui') walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('alert(')) {
    // Add import if not exists
    if (!content.includes('use-toast')) {
       // calculate relative path to hooks
       let depth = filePath.split('/').length - 2;
       let relativePrefix = depth <= 0 ? './' : '../'.repeat(depth);
       content = `import { toast } from '${relativePrefix}hooks/use-toast';\n` + content;
    }
    
    // Simple replacement
    content = content.replace(/alert\((.*)\)/g, (match, p1) => {
       if (!p1) return match;
       let isErr = p1.toLowerCase().includes('erreur') || p1.toLowerCase().includes('error') || p1.toLowerCase().includes('e.message') || p1.toLowerCase().includes('fail');
       let variant = isErr ? "variant: 'destructive', title: 'Erreur', " : "title: 'Information', ";
       return `toast({ ${variant}description: String(${p1}) })`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
