const fs = require('fs');
let content = fs.readFileSync('src/views/Dashboard.tsx', 'utf8');

content = content.replace(/throw new Error\("enrollments count"\);/g, 'totalSnap = { data: () => ({ count: 0 }) };\n                completedSnap = { data: () => ({ count: 0 }) };\n                activeSnap = { data: () => ({ count: 0 }) };');

content = content.replace(/throw new Error\("enrolSnap"\);/g, 'enrolSnap = { docs: [] };');
content = content.replace(/throw new Error\("historySnap"\);/g, 'historySnap = { docs: [] };');
content = content.replace(/throw new Error\("allCoursesSnap"\);/g, 'allCoursesSnap = { docs: [] };');

fs.writeFileSync('src/views/Dashboard.tsx', content);
console.log("Patched Dashboard.tsx");
