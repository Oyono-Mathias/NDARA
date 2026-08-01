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
  if (filePath === 'src/lib/logger.ts') return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('console.error(')) {
    // Add import
    let depth = filePath.split('/').length - 2;
    let relativePrefix = depth <= 0 ? './' : '../'.repeat(depth);
    if (!content.includes('import { logger }')) {
      content = `import { logger } from '${relativePrefix}lib/logger';\n` + content;
    }
    
    // Replace
    content = content.replace(/console\.error\(/g, 'logger.error(');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
