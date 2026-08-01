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
  let index = 0;
  while ((index = content.indexOf('useEffect(', index)) !== -1) {
    let balance = 1;
    let i = index + 10;
    while(balance > 0 && i < content.length) {
      if(content[i] === '(') balance++;
      else if(content[i] === ')') balance--;
      i++;
    }
    const effectBody = content.substring(index, i);
    // Find dependency array
    const match = effectBody.match(/,\s*\[(.*?)\]\s*\)$/s);
    if (match) {
        const deps = match[1].split(',').map(s => s.trim()).filter(Boolean);
        if (deps.length > 0 && effectBody.includes('set')) {
           // We might want to see which ones are causing issue.
           // A common issue is object/array in dependency array without useMemo
           if(deps.some(d => d.includes('.') || d.includes('{') || d.includes('props') || d.includes('location'))) { 
               console.log("Found in", file);
               console.log("Deps:", deps);
           }
        }
    }
    index = i;
  }
}
