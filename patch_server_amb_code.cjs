const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const codeGen = `
        const referralCode = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
`;
const fields = `
          referralCode: referralCode,
          referralLink: \`https://ndara.afrique/register?ref=\${referralCode}\`,
          uid: uid,
`;

code = code.replace("await ambRef.set({", `${codeGen}\n        await ambRef.set({\n${fields}`);

fs.writeFileSync('server.ts', code);
