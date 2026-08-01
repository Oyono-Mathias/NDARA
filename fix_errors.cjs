const fs = require('fs');

let f = 'src/components/instructor/quiz/editor/QuizEditor.tsx';
if (fs.existsSync(f)) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/e\.errors\.map/g, 'e.issues.map');
  fs.writeFileSync(f, c);
}

f = 'src/sw.ts';
if (fs.existsSync(f)) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/declare let self: ServiceWorkerGlobalScope;/g, 'declare let self: any;');
  fs.writeFileSync(f, c);
}

