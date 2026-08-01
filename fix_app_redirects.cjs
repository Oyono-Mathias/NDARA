const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

const redirectComponent = `
const RedirectWithParams = ({ to }: { to: string }) => {
  const location = useLocation();
  return <Navigate to={\`\${to}\${location.search}\`} replace />;
};
`;

if (!code.includes('RedirectWithParams')) {
    code = code.replace(
        "export default function App() {",
        redirectComponent + "\nexport default function App() {"
    );
    
    code = code.replace(
        '<Route path="/register" element={<Navigate to="/auth/register" replace />} />',
        '<Route path="/register" element={<RedirectWithParams to="/auth/register" />} />\n        <Route path="/signup" element={<RedirectWithParams to="/auth/register" />} />'
    );
    
    code = code.replace(
        '<Route path="/login" element={<Navigate to="/auth/login" replace />} />',
        '<Route path="/login" element={<RedirectWithParams to="/auth/login" />} />'
    );
    
    fs.writeFileSync(file, code);
    console.log("App.tsx redirects updated");
} else {
    console.log("App.tsx already updated");
}
