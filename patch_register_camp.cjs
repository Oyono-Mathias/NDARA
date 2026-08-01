const fs = require('fs');
const file = 'src/views/auth/RegisterView.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const campCode = localStorage.getItem(')) {
    code = code.replace(
        "body: JSON.stringify({ code: refCode })",
        "body: JSON.stringify({ code: refCode, camp: localStorage.getItem('ndara_camp') || undefined })"
    );
    // Let's add the camp code fetching earlier too just to be sure
    // It's not strictly necessary to fetch earlier, inline is fine.
    fs.writeFileSync(file, code);
}
