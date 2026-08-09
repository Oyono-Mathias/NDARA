const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorMarketing.tsx', 'utf8');

code = code.replace(
    /setEbooks\(marketSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\.filter\(i => i\.type === 'ebook'\)\);/,
    "setEbooks(marketSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).filter((i: any) => i.type === 'ebook'));"
);

fs.writeFileSync('src/views/ambassador/AmbassadorMarketing.tsx', code);
