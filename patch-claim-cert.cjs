const fs = require('fs');
let code = fs.readFileSync('src/views/CoursePlayer.tsx', 'utf8');

const exportCall = `
      // Automatiquement sauvegarder le certificat (Admin Drive Export)
      try {
        const certContent = \`Certificat d'Achèvement\\n\\nDécerné à: \${firebaseUser.displayName || 'Étudiant'}\\nFormation: \${course.title}\\nDate: \${new Date().toLocaleDateString('fr-FR')}\\nNuméro: \${certNumber}\`;
        
        await fetch('/api/admin/drive/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: \`Certificat_\${firebaseUser.displayName || 'Etudiant'}_\${course.title.substring(0,20)}.txt\`,
            content: certContent,
            mimeType: 'text/plain'
          })
        });
        console.log("Certificat sauvegardé automatiquement sur Google Drive.");
      } catch (err) {
        console.warn("Échec de la sauvegarde Google Drive:", err);
      }
`;

if (!code.includes('/api/admin/drive/export')) {
  code = code.replace(
    /const certNumber = 'CERT-' \+ Math.random\(\)\.toString\(36\)\.substr\(2, 9\)\.toUpperCase\(\);/,
    "const certNumber = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();" + exportCall
  );
  fs.writeFileSync('src/views/CoursePlayer.tsx', code);
  console.log("Drive export logic added to claimCertificate.");
} else {
  console.log("Already patched.");
}
