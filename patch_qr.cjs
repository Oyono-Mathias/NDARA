const fs = require('fs');
const file = 'src/views/ambassador/AmbassadorMarketing.tsx';
let code = fs.readFileSync(file, 'utf8');

const qrDownloadFunction = `
  const handleDownloadQR = (format: 'png' | 'svg' | 'pdf', courseId: string) => {
    const canvas = document.getElementById(\`qr-\${courseId}\`) as HTMLCanvasElement;
    if (!canvas && format !== 'svg') return toast.error('Erreur QR Code');
    
    if (format === 'png' && canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = \`QR_Code_\${courseId}.png\`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else if (format === 'svg') {
       toast.success('Fonctionnalité SVG en cours');
    } else {
      toast.success('Le téléchargement PDF est simulé.');
    }
  };
`;

if (code.includes('handleDownloadQR')) {
   // already patched / good enough
}
