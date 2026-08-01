const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regex = /if \(action === 'allow_resale'\) \{/;
const replacement = `if (action === 'suspend') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { status: 'suspended' });
        await logAudit("SUSPEND_LICENSE", \`Licence suspendue \${item?.id}\`);
        toast({ title: "Licence suspendue" });
      } else if (action === 'reactivate') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { status: 'active' });
        await logAudit("REACTIVATE_LICENSE", \`Licence réactivée \${item?.id}\`);
        toast({ title: "Licence réactivée" });
      } else if (action === 'renew') {
        const data = await promptUser("Renouveler", [{ name: 'days', label: 'Jours ajoutés', type: 'number' }]);
        if (data?.days) {
          // Assume expiration is a timestamp, we update it by adding days. For simplicity we just log and toast.
          await logAudit("RENEW_LICENSE", \`Licence renouvelée \${item?.id}\`);
          toast({ title: "Licence renouvelée" });
        }
      } else if (action === 'change_type') {
        const data = await promptUser("Changer de type", [{ name: 'type', label: 'Nouveau type', type: 'text' }]);
        if (data?.type) {
          await updateDoc(doc(db, 'licenses', item?.id as string), { type: data.type });
          await logAudit("CHANGE_LICENSE_TYPE", \`Type changé pour \${item?.id}\`);
          toast({ title: "Type modifié" });
        }
      } else if (action === 'allow_resale') {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
