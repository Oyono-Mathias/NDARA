import re

with open('src/views/TemplateMarket.tsx', 'r') as f:
    content = f.read()

# Make sure auth is imported
if 'import { auth }' not in content and 'import { db, auth }' not in content:
    content = content.replace('import { db } from "../firebase";', 'import { db, auth } from "../firebase";')

if 'const [licenseKey, setLicenseKey] = useState<string | null>(null);' not in content:
    content = content.replace(
        'const [showSuccessModal, setShowSuccessModal] = useState(false);',
        'const [showSuccessModal, setShowSuccessModal] = useState(false);\n  const [licenseKey, setLicenseKey] = useState<string | null>(null);'
    )

replacement_purchase = """
            setHasPurchased(true);
            setIsBuyModalOpen(false);
            
            // Auto generate license
            try {
                const licRes = await fetch('/api/digital/licenses/generate', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` },
                   body: JSON.stringify({ purchaseId: purchaseRef.id, productId: selectedTemplate.id, type: 'template' })
                });
                const licData = await licRes.json();
                if (licData.success) {
                    setLicenseKey(licData.license.licenseKey);
                }
            } catch (e) { console.error("License generation error", e); }
            
            setShowSuccessModal(true);
"""
content = re.sub(
    r"setHasPurchased\(true\);\s*setIsBuyModalOpen\(false\);\s*setShowSuccessModal\(true\);",
    replacement_purchase,
    content
)

replacement_download = """  const handleDownloadTemplate = async (templateId: string) => {
      try {
          setIsSubmitting(true);
          let currentLicenseKey = licenseKey;
          
          if (!currentLicenseKey) {
              const q = query(collection(db, 'digital_licenses'), where('userId', '==', currentUser?.uid), where('productId', '==', templateId), where('status', '==', 'active'));
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
              body: JSON.stringify({ licenseKey: currentLicenseKey, productId: templateId })
          });
          const data = await response.json();
          if (data.success) {
              alert("DRM Validé ! Redirection vers le téléchargement sécurisé du template...");
              window.open(data.downloadUrl, '_blank');
          } else {
              alert(data.error || "Erreur DRM lors du téléchargement");
          }
      } catch(e: any) {
          alert(e.message || "Erreur réseau");
      } finally {
          setIsSubmitting(false);
      }
  };"""

content = content.replace(
    '  const handleOpenModal = (template: any) => {',
    replacement_download + '\n\n  const handleOpenModal = (template: any) => {'
)

# Fix the button onClick
content = content.replace(
    """                 onClick={() => {
                    setIsBuyModalOpen(false);
                    alert("Téléchargement du template démarré.");
                 }}""",
    """                 onClick={() => {
                    setIsBuyModalOpen(false);
                    handleDownloadTemplate(selectedTemplate.id);
                 }}"""
)

with open('src/views/TemplateMarket.tsx', 'w') as f:
    f.write(content)
