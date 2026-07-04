import re

with open('src/services/authService.ts', 'r') as f:
    content = f.read()

# I will add `addDoc` to log in `audit_logs`
import_injection = """import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';"""

content = content.replace("import { auth } from '../firebase';", import_injection + "\\nimport { auth } from '../firebase';")

log_func = """
  async _logAudit(action: string, user: FirebaseUser) {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date()
      });
    } catch (e) {
      console.warn("Could not log audit", e);
    }
  }
"""

content = content.replace("async login(email: string, password: string) {", log_func + "\\n  async login(email: string, password: string) {")

login_replace = """  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    this._logAudit('LOGIN', cred.user);
    return cred;
  }"""
content = re.sub(r'async login\(email: string, password: string\) \{\s*return signInWithEmailAndPassword\(auth, email, password\);\s*\}', login_replace, content)

logout_replace = """  async logout() {
    if (auth.currentUser) {
      await this._logAudit('LOGOUT', auth.currentUser);
    }
    await signOut(auth);
  }"""
content = re.sub(r'async logout\(\) \{\s*await signOut\(auth\);\s*\}', logout_replace, content)

with open('src/services/authService.ts', 'w') as f:
    f.write(content)
