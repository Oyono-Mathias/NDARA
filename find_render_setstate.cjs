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
  // Match setSomething( inside component body, outside of functions/effects
  // This is hard to do with regex, but we can look for `set[A-Z]\w+\(`
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\s*set[A-Z]\w*\(/) && !line.includes('useEffect') && !line.includes('=>') && !line.includes('if')) {
      // it might be a setState call right in the body!
      console.log(file, i+1, line);
    }
  }
}
