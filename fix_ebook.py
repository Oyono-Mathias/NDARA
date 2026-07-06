import re

with open('src/views/EbookDetail.tsx', 'r') as f:
    content = f.read()

# Add a state for licenseKey if not there
if 'const [licenseKey, setLicenseKey] = useState<string | null>(null);' not in content:
    content = content.replace(
        'const [showSuccessModal, setShowSuccessModal] = useState(false);',
        'const [showSuccessModal, setShowSuccessModal] = useState(false);\n  const [licenseKey, setLicenseKey] = useState<string | null>(null);'
    )

replacement_purchase = """
            setHasPurchased(true);
            setShowBuyModal(false);
            
            // Auto generate license
            try {
                const licRes = await fetch('/api/digital/licenses/generate', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` },
                   body: JSON.stringify({ purchaseId: purchaseRef.id, productId: ebook.id, type: 'ebook' })
                });
                const licData = await licRes.json();
                if (licData.success) {
                    setLicenseKey(licData.license.licenseKey);
                }
            } catch (e) { console.error("License generation error", e); }
            
            setShowSuccessModal(true);
"""
content = re.sub(
    r"setHasPurchased\(true\);\s*setShowBuyModal\(false\);\s*setShowSuccessModal\(true\);",
    replacement_purchase,
    content
)

replacement_download = """  const handleDownload = async () => {
      try {
          setIsProcessing(true);
          // If we don't have the licenseKey yet, we should ideally fetch it from Firestore.
          // But for this simulation, if we don't have it, we just use a generic one or throw an error.
          let currentLicenseKey = licenseKey;
          
          if (!currentLicenseKey) {
              // Try to fetch existing license
              const q = query(collection(db, 'digital_licenses'), where('userId', '==', currentUser?.uid), where('productId', '==', ebook.id), where('status', '==', 'active'));
              const snap = await getDocs(q);
              if (!snap.empty) {
                  currentLicenseKey = snap.docs[0].data().licenseKey;
                  setLicenseKey(currentLicenseKey);
              } else {
                  alert("Licence introuvable. Veuillez contacter le support.");
                  return;
              }
          }

          const response = await fetch('/api/digital/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` },
              body: JSON.stringify({ licenseKey: currentLicenseKey, productId: ebook.id })
          });
          const data = await response.json();
          if (data.success) {
              alert("DRM Validé ! Redirection vers le téléchargement sécurisé...");
              window.open(data.downloadUrl, '_blank');
          } else {
              alert(data.error || "Erreur DRM lors du téléchargement");
          }
      } catch(e: any) {
          alert(e.message || "Erreur réseau");
      } finally {
          setIsProcessing(false);
      }
  };"""

content = re.sub(
    r"const handleDownload = \(\) => \{\s*// Create a blob and trigger download of a secure format\s*alert\([^)]+\);\s*\};",
    replacement_download,
    content
)

with open('src/views/EbookDetail.tsx', 'w') as f:
    f.write(content)
