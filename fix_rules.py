import re

with open('firestore.rules', 'r') as f:
    content = f.read()

rules_to_add = """
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() && (isAdmin() || request.resource.data.action in ['LOGIN', 'LOGOUT']);
      allow update, delete: if false; // immutable
    }
    
    match /roles/{roleId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
"""

content = content.replace("match /settings/{settingId} {", rules_to_add + "\n    match /settings/{settingId} {")

with open('firestore.rules', 'w') as f:
    f.write(content)
