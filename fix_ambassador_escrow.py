import re

with open('src/views/Ambassador.tsx', 'r') as f:
    content = f.read()

replacement = """
    useEffect(() => {
        if (!currentUser?.uid) return;
        
        // Auto-release expired escrows for this user
        const releaseEscrows = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (token) {
                    await fetch('/api/wallet/release-escrows', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
            } catch (e) {
                console.error("Escrow release error", e);
            }
        };
        releaseEscrows();

        const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
"""

if 'release-escrows' not in content:
    content = content.replace(
        """    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {""",
        replacement
    )

with open('src/views/Ambassador.tsx', 'w') as f:
    f.write(content)
