const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'admin', 'AdminMemberProfileView.tsx');
let code = fs.readFileSync(file, 'utf8');

const roleUpdateLogic = `
  const handleRolesUpdate = async (role: string, action: 'add' | 'remove') => {
    try {
      if (await confirm(\`\${action === 'add' ? 'Attribuer' : 'Retirer'} le rôle \${role} ?\`)) {
        let currentRoles = member.roles || [member.role].filter(Boolean) || [];
        if (action === 'add' && !currentRoles.includes(role)) currentRoles.push(role);
        if (action === 'remove') currentRoles = currentRoles.filter((r: string) => r !== role);
        await updateDoc(doc(db, 'users', memberId), { roles: currentRoles, role: currentRoles[0] || 'student' });
        
        // --- AMBASSADOR LOGIC ---
        if (role === 'ambassador') {
          const ambassadorRef = doc(db, 'ambassadors', memberId);
          if (action === 'add') {
            const ambSnap = await getDoc(ambassadorRef);
            if (!ambSnap.exists()) {
              const code = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
              await setDoc(ambassadorRef, {
                uid: memberId,
                referralCode: code,
                referralLink: \`\${window.location.origin}/register?ref=\${code}\`,
                activatedAt: serverTimestamp(),
                activatedBy: auth.currentUser?.uid || 'admin',
                status: 'active',
                totalReferrals: 0,
                totalSales: 0,
                totalCommission: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            } else {
              await updateDoc(ambassadorRef, { status: 'active', updatedAt: serverTimestamp() });
            }
          } else if (action === 'remove') {
            await updateDoc(ambassadorRef, { status: 'inactive', updatedAt: serverTimestamp() });
          }
        }
        // ------------------------

        await logAudit("UPDATE_ROLES", \`\${action} rôle: \${role}\`);
        toast({ title: "Rôle mis à jour" });
      }
    } catch(e: unknown) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };
`;

code = code.replace(
  /const handleRolesUpdate = async \(role: string, action: 'add' \| 'remove'\) => \{[\s\S]*?toast\(\{ title: "Erreur", variant: "destructive" \}\);\n\s*\}\n\s*\};/,
  roleUpdateLogic.trim()
);

fs.writeFileSync(file, code);
console.log("Roles logic updated");
