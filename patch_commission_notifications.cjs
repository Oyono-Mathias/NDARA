const fs = require('fs');

function patchCommissionEngine() {
  let code = fs.readFileSync('src/lib/commissionEngine.ts', 'utf8');
  if (!code.includes('Action sur votre commission')) {
    code = code.replace(
      'await notificationRef.set({',
      `// Try to send email
      try {
        const { sendEmail } = await import("./mailTransporter.js");
        const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
        if (ambUser.exists && ambUser.data()?.email) {
           await sendEmail(ambUser.data()?.email, "Nouvelle commission !", \`Félicitations, vous avez reçu une commission de \${commissionAmount} XAF.\`);
        }
      } catch(e) {}
      await notificationRef.set({`
    );

    code = code.replace(
      '// 1. Update commission status',
      `
      // Notifications
      const notificationRef = adminDb.collection('notifications').doc();
      t.set(notificationRef, {
        userId: ambassadorUid,
        title: "Commission annulée",
        message: \`Votre commission de \${commissionAmount} XAF a été annulée.\`,
        type: "commission_cancellation",
        isRead: false,
        createdAt: FieldValue.serverTimestamp()
      });
      // Try to send email
      try {
        const { sendEmail } = await import("./mailTransporter.js");
        const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
        if (ambUser.exists && ambUser.data()?.email) {
           await sendEmail(ambUser.data()?.email, "Commission annulée", \`Votre commission de \${commissionAmount} XAF a été annulée.\`);
        }
      } catch(e) {}
      
      // 1. Update commission status`
    );
    
    fs.writeFileSync('src/lib/commissionEngine.ts', code);
  }
}

function patchServer() {
  let code = fs.readFileSync('server.ts', 'utf8');
  if (!code.includes('Votre commission de \${amount} XAF a été')) {
    code = code.replace(
      "t.update(commissionRef, { status: 'validated', validatedAt: FieldValue.serverTimestamp() });",
      `t.update(commissionRef, { status: 'validated', validatedAt: FieldValue.serverTimestamp() });
                const notifRef = adminDb.collection('notifications').doc();
                t.set(notifRef, {
                    userId: ambassadorUid,
                    title: "Commission validée",
                    message: \`Votre commission de \${amount} XAF a été validée et ajoutée à votre portefeuille.\`,
                    type: "commission_validated",
                    isRead: false,
                    createdAt: FieldValue.serverTimestamp()
                });
                try {
                  const { sendEmail } = await import("./src/lib/mailTransporter.js");
                  const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
                  if (ambUser.exists && ambUser.data()?.email) {
                     await sendEmail(ambUser.data()?.email, "Commission validée", \`Votre commission de \${amount} XAF a été validée.\`);
                  }
                } catch(e) {}
      `
    );

    code = code.replace(
      "t.update(commissionRef, { status: 'paid', paidAt: FieldValue.serverTimestamp() });",
      `t.update(commissionRef, { status: 'paid', paidAt: FieldValue.serverTimestamp() });
                const notifRef = adminDb.collection('notifications').doc();
                t.set(notifRef, {
                    userId: ambassadorUid,
                    title: "Commission payée",
                    message: \`Votre commission de \${amount} XAF a été payée.\`,
                    type: "commission_paid",
                    isRead: false,
                    createdAt: FieldValue.serverTimestamp()
                });
                try {
                  const { sendEmail } = await import("./src/lib/mailTransporter.js");
                  const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
                  if (ambUser.exists && ambUser.data()?.email) {
                     await sendEmail(ambUser.data()?.email, "Commission payée", \`Votre commission de \${amount} XAF a été payée.\`);
                  }
                } catch(e) {}
      `
    );
    fs.writeFileSync('server.ts', code);
  }
}

try {
  patchCommissionEngine();
  patchServer();
} catch(e) { console.error(e) }
