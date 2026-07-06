import re

with open('src/views/instructor/InstructorWealth.tsx', 'r') as f:
    content = f.read()

replacement = """  useEffect(() => {
    if (!instructor?.uid) return;
    const instructorId = instructor.uid;

    // Auto-release expired escrows for instructor
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

    // Listen to the instructor's profile in real time to fetch current balance & affiliate balance
    const unsubUser = onSnapshot(doc(db, "users", instructorId), (snap) => {"""

if 'releaseEscrows();' not in content:
    content = content.replace(
"""  useEffect(() => {
    if (!instructor?.uid) return;
    const instructorId = instructor.uid;

    // Listen to the instructor's profile in real time to fetch current balance & affiliate balance
    const unsubUser = onSnapshot(doc(db, "users", instructorId), (snap) => {""", replacement)

if 'import { auth, db }' not in content and 'import { db, auth }' not in content:
    content = content.replace('import { db } from "../../firebase";', 'import { db, auth } from "../../firebase";')

with open('src/views/instructor/InstructorWealth.tsx', 'w') as f:
    f.write(content)
