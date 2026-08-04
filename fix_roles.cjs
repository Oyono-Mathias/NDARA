const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf8');

// 1. Remove the entire "roles" tab from the UI
code = code.replace(
  /\{\s*activeTab === 'roles' && \([\s\S]*?\}\s*\)\s*\}/,
  ""
);

// 2. Remove the "roles" tab selector
code = code.replace(
  /\{ id: 'roles', label: 'Rôles', icon: ShieldCheck \},/,
  ""
);

// 3. Remove handleRolesUpdate function
code = code.replace(
  /const handleRolesUpdate = async \([\s\S]*?\}\s*catch\(e: unknown\) \{\s*toast\(\{ title: "Erreur", variant: "destructive", description: \(e as Error\)\.message \}\);\s*\}\s*\};\s*/,
  ""
);

// 4. Update handleUpdateRole to include Ambassador logic
const handleUpdateRoleReplacement = `const handleUpdateRole = async (newRole: string) => {
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', memberId), { role: newRole });
      
      // --- AMBASSADOR LOGIC ---
      const ambassadorRef = doc(db, 'ambassadors', memberId);
      if (newRole === 'ambassador') {
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
      } else {
        // If they are no longer an ambassador, we could optionally deactivate them
        const ambSnap = await getDoc(ambassadorRef);
        if (ambSnap.exists()) {
            await updateDoc(ambassadorRef, { status: 'inactive', updatedAt: serverTimestamp() });
        }
      }
      // ------------------------

      await logAudit("CHANGE_ROLE", \`Role changed to \${newRole}\`);
      toast({ title: "Rôle mis à jour avec succès" });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour du rôle", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };`;

code = code.replace(
  /const handleUpdateRole = async \(newRole: string\) => \{[\s\S]*?\}\s*\};\s*const handleUpdateProfile/,
  handleUpdateRoleReplacement + "\n  const handleUpdateProfile"
);

// 5. Add Ambassador button to the Admin tab
code = code.replace(
  /<button onClick=\{\(\) => handleUpdateRole\('instructor'\)\} className=\{clsx\("py-3 rounded-xl text-xs font-bold transition-colors", member\.role === 'instructor' \? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"\)\}>Instructor<\/button>/,
  `<button onClick={() => handleUpdateRole('instructor')} className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", member.role === 'instructor' ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>Instructor</button>
                    <button onClick={() => handleUpdateRole('ambassador')} className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", member.role === 'ambassador' ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>Ambassador</button>`
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', code);
