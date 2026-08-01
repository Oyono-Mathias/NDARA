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
       let depth = filePath.split('/').length - 2;
       let relativePrefix = depth <= 0 ? './' : '../'.repeat(depth);
       content = `import { toast } from '${relativePrefix}hooks/use-toast';\n` + content;
    }
    
    // Replace multiline alerts
    content = content.replace(/alert\([\s\S]*?\)/g, (match) => {
       // extract the string inside alert(...)
       let inner = match.substring(6, match.length - 1).trim();
       if (!inner) return match;
       let isErr = inner.toLowerCase().includes('erreur') || inner.toLowerCase().includes('error') || inner.toLowerCase().includes('e.message') || inner.toLowerCase().includes('fail');
       let variant = isErr ? "variant: 'destructive', title: 'Erreur', " : "title: 'Information', ";
       return `toast({ ${variant}description: String(${inner}) })`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
