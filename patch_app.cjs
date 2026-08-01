const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('GoogleWorkspaceTest')) {
  // Add import
  code = code.replace(
    "const MathiasTutor = React.lazy(() => import('./views/MathiasTutor').then(module => ({ default: module.MathiasTutor })));",
    "const MathiasTutor = React.lazy(() => import('./views/MathiasTutor').then(module => ({ default: module.MathiasTutor })));\nconst GoogleWorkspaceTest = React.lazy(() => import('./views/GoogleWorkspaceTest').then(module => ({ default: module.GoogleWorkspaceTest })));"
  );
  
  // Add route under PublicLayout or a specific layout
  code = code.replace(
    "<Route path=\"test\" element={<UniversalPlayground />} />",
    "<Route path=\"test\" element={<UniversalPlayground />} />\n          <Route path=\"google-test\" element={<GoogleWorkspaceTest />} />"
  );
  
  // Also wrap root with GoogleOAuthProvider
  code = code.replace(
    "import { Toaster } from \"sonner\";",
    "import { Toaster } from \"sonner\";\nimport { GoogleOAuthProvider } from '@react-oauth/google';"
  );
  
  code = code.replace(
    "<BrowserRouter>",
    `<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>\n      <BrowserRouter>`
  );
  
  code = code.replace(
    "</BrowserRouter>",
    `</BrowserRouter>\n      </GoogleOAuthProvider>`
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
