const fs = require('fs');

function fixFile(path, oldText, newText) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content);
}

fixFile('src/lib/r2Upload.ts', 
  '    const { uploadId } = await initRes.json();',
  `    const initText = await initRes.text();
    let initData;
    try {
      initData = JSON.parse(initText);
    } catch(e) {
      if (initText.includes("<!doctype html>") || initText.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }
    const { uploadId } = initData;`
);

fixFile('src/lib/r2Upload.ts', 
  '    const { publicUrl } = await finishRes.json();',
  `    const finishText = await finishRes.text();
    let finishData;
    try {
      finishData = JSON.parse(finishText);
    } catch(e) {
      if (finishText.includes("<!doctype html>") || finishText.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }
    const { publicUrl } = finishData;`
);

fixFile('src/lib/bunnyUpload.ts', 
  '    data = await res.json();',
  `    const textData = await res.text();
    try {
      data = JSON.parse(textData);
    } catch(e) {
      if (textData.includes("<!doctype html>") || textData.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }`
);

fixFile('src/lib/cloudflareUpload.ts', 
  '    data = await res.json();',
  `    const textData = await res.text();
    try {
      data = JSON.parse(textData);
    } catch(e) {
      if (textData.includes("<!doctype html>") || textData.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }`
);
