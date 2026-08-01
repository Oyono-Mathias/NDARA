const fs = require('fs');
let content = fs.readFileSync('src/services/authService.ts', 'utf-8');

if (!content.includes('signInWithCustomToken')) {
    content = content.replace(/sendEmailVerification,\s*User as FirebaseUser,/, 'sendEmailVerification,\n  signInWithCustomToken,\n  User as FirebaseUser,');
    content = content.replace(/async login\(email: string, password: string\) \{/, `
  async loginWithToken(token: string) {
    const cred = await signInWithCustomToken(auth, token);
    this._logAudit('IMPERSONATION_LOGIN', cred.user);
    return cred;
  }

  async login(email: string, password: string) {`);
    fs.writeFileSync('src/services/authService.ts', content);
    console.log("signInWithCustomToken added");
}
