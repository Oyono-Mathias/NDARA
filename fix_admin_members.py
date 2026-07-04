import re

with open('src/views/admin/AdminMembers.tsx', 'r') as f:
    content = f.read()

# Replace certificates query
old_cert = "q = query(collection(db, 'certificates'), where('userId', '==', selectedMember.id));"
new_cert = "q = query(collection(db, 'certificates'), where('studentId', '==', selectedMember.id));"
content = content.replace(old_cert, new_cert)

old_course = "q = query(collection(db, 'enrollments'), where('userId', '==', selectedMember.id));"
new_course = "q = query(collection(db, 'enrollments'), where('studentId', '==', selectedMember.id));"
content = content.replace(old_course, new_course)

# Block user implementation
block_func = """
  const handleToggleBlock = async () => {
    if (!selectedMember) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', selectedMember.id), { 
        status: selectedMember.status === 'blocked' ? 'active' : 'blocked' 
      });
      setToastMessage(selectedMember.status === 'blocked' ? 'Compte débloqué' : 'Compte bloqué');
    } catch (e) {
      console.error(e);
      setToastMessage("Erreur");
    } finally {
      setIsMutating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleResetProgress = async () => {
    if (!selectedMember) return;
    setIsMutating(true);
    try {
      // Find all progress docs and delete them
      const pQuery = query(collection(db, 'progress'), where('studentId', '==', selectedMember.id));
      const pSnap = await getDocs(pQuery);
      
      const batch = writeBatch(db);
      pSnap.docs.forEach(d => {
        batch.delete(doc(db, 'progress', d.id));
      });
      await batch.commit();
      
      setToastMessage("Progression réinitialisée avec succès");
    } catch (e) {
      console.error(e);
      setToastMessage("Erreur lors de la réinitialisation");
    } finally {
      setIsMutating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };
"""

content = content.replace("import { collection, query, onSnapshot, doc, updateDoc, where, addDoc, runTransaction, limit } from 'firebase/firestore';", "import { collection, query, onSnapshot, doc, updateDoc, where, addDoc, runTransaction, limit, getDocs, writeBatch } from 'firebase/firestore';")

content = content.replace("  const handleUpdateRole = async (userId: string, currentRole: string) => {", block_func + "\n  const handleUpdateRole = async (userId: string, currentRole: string) => {")

block_button = """
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <button onClick={handleResetProgress} disabled={isMutating} className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <History className="w-5 h-5" />
                        <span className="font-bold text-sm">Réinitialiser la progression</span>
                      </div>
                    </button>
                    <button onClick={handleToggleBlock} disabled={isMutating} className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <Ban className="w-5 h-5" />
                        <span className="font-bold text-sm">{selectedMember.status === 'blocked' ? 'Débloquer le compte' : 'Bloquer le compte'}</span>
                      </div>
                    </button>
                  </div>
"""

content = content.replace("              {/* Danger Zone */}", "              {/* Danger Zone */}\n" + block_button)

with open('src/views/admin/AdminMembers.tsx', 'w') as f:
    f.write(content)
