import re

with open('src/views/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace the handlePayment logic for Mobile Money and Card
replacement = """    } else if (activeMethod.provider === 'mesomb' || activeMethod.provider === 'mobile_money') {
        if (!certifiedNumber) {
            alert(`Veuillez enregistrer votre numéro ${activeMethod.name} dans votre profil.`);
            return;
        }
        setIsAwaitingUssd(true);
        setIsProcessing(true);
        
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch('/api/payment/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    amount: course.price,
                    currency: countryData?.currency || 'XAF',
                    method: activeMethod.id === 'mtn_momo' ? 'mtn' : 'orange',
                    type: 'course_purchase',
                    courseId: course.id,
                    courseTitle: course.title,
                    sellerId: course.instructorId || 'admin',
                    phone: certifiedNumber
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Wait a bit to simulate user validation
                setTimeout(async () => {
                    setIsAwaitingUssd(false);
                    setIsProcessing(false);
                    setIsSuccess(true);
                }, 5000);
            } else {
                throw new Error(data.error || "Erreur de paiement");
            }
        } catch (e: any) {
             setIsAwaitingUssd(false);
             setErrorModal({ isOpen: true, title: 'Erreur Paiement', message: e.message || 'Impossible de joindre le serveur' });
             setIsProcessing(false);
        }
    } else if (selectedMethodId === 'virtual') {"""

content = re.sub(
    r"    \} else if \(activeMethod\.provider === 'mesomb'\) \{.*?\} else if \(selectedMethodId === 'virtual'\) \{",
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/views/Checkout.tsx', 'w') as f:
    f.write(content)
