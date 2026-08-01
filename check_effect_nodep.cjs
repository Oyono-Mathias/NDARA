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
    // Find if there's no dependency array:
    // It should end with `})` or `} )`
    if (effectBody.match(/\}\s*\)$/)) {
        if (effectBody.includes('set')) {
            console.log(`POTENTIAL EFFECT LOOP in ${file}: \n${effectBody}`);
        }
    }
    index = i;
  }
}
