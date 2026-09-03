const fs = require('fs');
let code = fs.readFileSync('src/views/auth/LoginView.tsx', 'utf8');

const devButtons = `
        {/* DEV ONLY MOCK LOGIN */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="text-sm font-bold text-amber-800 mb-2">Dev Mode: Connexion Rapide (Phase 48)</h3>
          <div className="grid grid-cols-2 gap-2">
            {['user', 'instructor', 'admin', 'agent'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  localStorage.setItem('mock_auth_role', r);
                  window.location.href = '/dashboard';
                }}
                className="py-2 px-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-200"
              >
                Login as {r}
              </button>
            ))}
          </div>
        </div>
        {/* END DEV ONLY */}
`;

code = code.replace(
  '<p className="mt-8 text-center text-sm text-gray-600">',
  devButtons + '\n        <p className="mt-8 text-center text-sm text-gray-600">'
);

fs.writeFileSync('src/views/auth/LoginView.tsx', code);
