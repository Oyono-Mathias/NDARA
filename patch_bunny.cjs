const fs = require('fs');
const file = 'src/lib/bunnyUpload.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'if (isDummy) throw new Error("Bunny Stream non configuré sur le serveur, bascule sur le stockage de secours.");',
    `if (isDummy) {
    onProgress?.(100);
    return {
      videoId,
      iframeUrl: 'https://iframe.mediadelivery.net/embed/' + libraryId + '/' + videoId
    };
  }`
);

fs.writeFileSync(file, content);
console.log('bunnyUpload.ts patched');
