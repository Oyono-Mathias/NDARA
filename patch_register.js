import fs from 'fs';

let content = fs.readFileSync('src/views/auth/RegisterView.tsx', 'utf8');

const regex = /const handleSubmit = async \(e: React.FormEvent\) => \{([\s\S]*?)\};/;
const replacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refCode && refValid === false) return; // Empêcher l'inscription

    setError(null);
    setIsLoading(true);

    try {
      await authService.register(email, password, displayName, 'student');
      const user = authService.getCurrentUser();
      
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refCode: (refCode && refValid) ? refCode : undefined })
        });
        
        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           throw new Error(errData.error || 'Erreur lors de la création du profil');
        }
      }

      await reloadUser();
      navigate('/auth/verify-email');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
      setIsLoading(false);
    }
  };`;

content = content.replace(regex, replacement);

// Also remove `setDoc`, `doc` from imports since we don't use them here, but keeping them is fine.
fs.writeFileSync('src/views/auth/RegisterView.tsx', content);
console.log("Patched Register!");
