const { execSync } = require('child_process');
try {
  const result = execSync('git log -p -n 3 src/views/admin/AdminSettings.tsx').toString();
  console.log(result);
} catch(e) {
  console.error(e.message);
}
