const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorLayout.tsx', 'utf8');

code = code.replace(
  /<Route\s*path="ambassador"\s*element=\{\s*<GenericPlaceholder\s*title="Ambassadeur Elite"\s*subtitle="Programme de partenariat Premium"\s*\/>\s*\}\s*\/>/,
  '<Route path="ambassador" element={<Navigate to="/ambassador/dashboard" replace />} />'
);

fs.writeFileSync('src/views/instructor/InstructorLayout.tsx', code);
