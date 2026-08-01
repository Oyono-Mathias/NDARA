const fs = require('fs');

function fixOnProgress(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/onProgress\(([^)]+)\)/g, 'onProgress?.($1)');
    fs.writeFileSync(file, code, 'utf8');
}

fixOnProgress('src/lib/r2Upload.ts');
fixOnProgress('src/lib/bunnyUpload.ts');
fixOnProgress('src/lib/cloudflareUpload.ts');
