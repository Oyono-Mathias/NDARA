import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

# Add logic for correction
correction_logic = """
  const handleCorrectTransaction = async (txId: string) => {
    const newAmount = window.prompt("Entrez le nouveau montant (laissez vide pour annuler):");
    if (!newAmount || isNaN(Number(newAmount))) return;
    
    try {
      await updateDoc(doc(db, 'transactions', txId), { amount: Number(newAmount), updatedAt: new Date() });
      alert("Transaction corrigée avec succès !");
    } catch (e: any) {
      alert("Erreur lors de la correction: " + e.message);
    }
  };
"""

content = content.replace("const toggleWalletStatus", correction_logic + "\n  const toggleWalletStatus")


# Add the correct button in the UI
correct_btn = """
                    <button 
                      onClick={() => handleCorrectTransaction(tx.id)}
                      className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-colors"
                    >
                      Corriger
                    </button>
"""

content = content.replace("                  <div className=\"flex flex-col items-end gap-1\">", "                  <div className=\"flex flex-col items-end gap-1\">\n" + correct_btn)

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
