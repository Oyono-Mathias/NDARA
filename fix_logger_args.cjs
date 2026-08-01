const fs = require('fs');

const files = [
  'src/lib/bunnyUpload.ts',
  'src/lib/cloudflareUpload.ts',
  'src/sw.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/logger\.error\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, 'logger.error($1 + " " + $2, $3)');
    fs.writeFileSync(f, content, 'utf8');
  }
});
