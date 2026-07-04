import re

with open('src/views/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace client-side enrollment creation
content = re.sub(r'const { setDoc, doc, collection } = await import\("firebase/firestore"\);\s*await setDoc\(doc\(collection\(db, \'enrollments\'\)\), {[\s\S]*?}\);', '// L\'inscription est maintenant gérée automatiquement par le backend lors du paiement', content)

# But wait, what if course is FREE?
# The prompt says: "Vérifier si la formation est gratuite ou payante"
# If the course is free, we don't need to call the wallet API, we just create the enrollment!

free_logic = """
  const handlePayment = async () => {
    if (!course) return;
    
    // Check if free
    if (course.price === 0) {
      setIsProcessing(true);
      try {
        const { setDoc, doc, collection } = await import("firebase/firestore");
        await setDoc(doc(collection(db, 'enrollments')), {
          studentId: currentUser.uid,
          courseId: course.id,
          enrolledAt: new Date(),
          progress: 0,
          instructorId: course.instructorId || 'admin'
        });
        setIsSuccess(true);
      } catch (e: any) {
        setErrorModal({ isOpen: true, title: 'Erreur', message: e.message || 'Impossible de vous inscrire à cette formation gratuite.' });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (!activeMethod) return;
"""

content = content.replace("  const handlePayment = async () => {\n    if (!course || !activeMethod) return;", free_logic)


# I also need to add auth headers to the API call! The wallet backend requires `isAuthenticated` which reads `Authorization: Bearer <token>`.
content = content.replace("headers: { 'Content-Type': 'application/json' },", "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` },")

with open('src/views/Checkout.tsx', 'w') as f:
    f.write(content)
