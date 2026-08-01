const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walk(fullPath, files);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of walk('src')) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let openBraces = 0;
  let inComponent = false;
  
  for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/export (default )?function [A-Z]/)) {
          inComponent = true;
          openBraces = 1;
      } else if (inComponent) {
          openBraces += (line.match(/\{/g) || []).length;
          openBraces -= (line.match(/\}/g) || []).length;
          
          if (openBraces === 1 && line.match(/set[A-Z]\w*\(/)) {
              if (!line.includes('=>') && !line.includes('return ') && !line.trim().startsWith('//')) {
                  console.log(`POTENTIAL RENDER LOOP in ${file}:${i+1}: ${line.trim()}`);
              }
          }
          
          if (openBraces === 0) {
              inComponent = false;
          }
      }
  }
}
