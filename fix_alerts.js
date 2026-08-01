const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') walkDir(dirPath, callback);
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
       let depth = filePath.split(path.sep).length - 2;
       let relativePrefix = depth === 0 ? './' : '../'.repeat(depth);
       content = `import { toast } from '${relativePrefix}hooks/use-toast';\n` + content;
    }
    
    // Replace alert(...) with toast(...)
    // This regex handles alert('...') or alert("...") or alert(`...`)
    // We replace it with toast({ description: ... })
    // We will do a generic regex that captures the content inside alert()
    // It's a bit tricky to capture balanced parentheses, but we can do a simple replace
    content = content.replace(/alert\(([^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g, (match, p1) => {
       if (match === "alert(data.error || 'Erreur lors du remboursement')") return "toast({ variant: 'destructive', title: 'Erreur', description: data.error || 'Erreur lors du remboursement' })";
       if (!p1) return match;
       let isErr = p1.toLowerCase().includes('erreur') || p1.toLowerCase().includes('error') || p1.toLowerCase().includes('e.message');
       let variant = isErr ? "variant: 'destructive', title: 'Erreur', " : "title: 'Information', ";
       return `toast({ ${variant}description: ${p1} })`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
