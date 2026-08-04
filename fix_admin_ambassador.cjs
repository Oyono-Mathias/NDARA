const fs = require('fs');

let code = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf8');

const originalHandleUpdateRole = `const handleUpdateRole = async (newRole: string) => {
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

const newHandleUpdateRole = `const handleUpdateRole = async (newRole: string) => {
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', memberId), { role: newRole });
      await logAudit("CHANGE_ROLE", \`Role changed to \${newRole}\`);
      toast({ title: "Rôle mis à jour avec succès" });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour du rôle", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };`;

code = code.replace(originalHandleUpdateRole, newHandleUpdateRole);

code = code.replace(
  /<button onClick=\{\(\) => handleUpdateRole\('ambassador'\)\} className=\{clsx\("py-3 rounded-xl text-xs font-bold transition-colors", member\.role === 'ambassador' \? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"\)\}>Ambassador<\/button>\n/g,
  ""
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', code);
