const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', 'utf8');

code = code.replace(/setAssignments\(snap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);/g, `const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a: any, b: any) => {
        const dA = a.createdAt?.toMillis?.() || 0;
        const dB = b.createdAt?.toMillis?.() || 0;
        return dB - dA;
      });
      setAssignments(fetched);`);

fs.writeFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', code, 'utf8');
