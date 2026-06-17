import { adminDb } from '../src/lib/firebaseAdmin';

// Types pour le calcul
interface WalletState {
  balance: number;
  affiliateBalance: number;
  pendingBalance: number;
  pendingAffiliateBalance: number;
}

async function runReconciliation(applyMigration = false) {
  console.log('--- NDARA WALLET V2 : AUDIT ET MIGRATION ---');
  console.log(`Mode: ${applyMigration ? 'MIGRATION (ECRITURE ACTIVE)' : 'DRY-RUN (LECTURE SEULE)'}\n`);

  try {
    const usersSnap = await adminDb.collection('users').get();
    let totalMismatch = 0;
    let corruptedPendingCount = 0;

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const currentTotals: WalletState = {
        balance: userData.balance || 0,
        affiliateBalance: userData.affiliateBalance || 0,
        pendingBalance: userData.pendingBalance || 0,
        pendingAffiliateBalance: userData.pendingAffiliateBalance || 0,
      };

      // Calcul des soldes théoriques depuis les transactions
      const theoretical: WalletState = {
        balance: 0,
        affiliateBalance: 0,
        pendingBalance: 0,
        pendingAffiliateBalance: 0,
      };

      const txSnap = await adminDb.collection('users').doc(userDoc.id).collection('transactions').get();
      const transactions = txSnap.docs.map(doc => doc.data());

      for (const tx of transactions) {
        if (tx.status === 'completed') {
          if (tx.type === 'deposit') theoretical.balance += tx.amount;
          if (tx.type === 'purchase_deduction') theoretical.balance -= tx.amount; // Achat d'une formation ou licence (Ndara tire du solde principal par défaut)
          if (tx.type === 'course_sale') theoretical.balance += tx.amount;
          if (tx.type === 'affiliate_payout') theoretical.affiliateBalance += tx.amount;
          if (tx.type === 'payout_deduction') {
             // Il faudrait savoir de quel solde on a déduit, on assume le comportement classique
             if (tx.metadata?.deductedFromAffiliate) {
                 theoretical.affiliateBalance -= tx.amount;
             } else {
                 theoretical.balance -= tx.amount;
             }
          }
           if (tx.type === 'transfer') {
             if (tx.amount > 0) theoretical.balance += tx.amount;
             else theoretical.balance += tx.amount; // tx.amount is usually negative for sender
          }
        } else if (tx.status === 'pending') {
          // Séquestre
           if (tx.type === 'course_sale') {
              theoretical.pendingBalance += tx.amount;
           } else if (tx.type === 'affiliate_payout') {
              theoretical.pendingAffiliateBalance += tx.amount;
           }
        }
      }

      const hasBalanceMismatch = currentTotals.balance !== theoretical.balance || currentTotals.affiliateBalance !== theoretical.affiliateBalance;
      
      // Detection de corruption V1 (fusion de pending)
      // En V1, pendingBalance fusionnait ventes et affiliations. pendingAffiliateBalance n'était pas mis à jour ou copié.
      const hasCorruptedPending = (currentTotals.pendingBalance > 0 && currentTotals.pendingAffiliateBalance === 0 && theoretical.pendingAffiliateBalance > 0) || 
                                  (currentTotals.pendingBalance !== theoretical.pendingBalance || currentTotals.pendingAffiliateBalance !== theoretical.pendingAffiliateBalance);

      if (hasBalanceMismatch || hasCorruptedPending) {
        console.log(`❌ Incohérence détectée pour l'utilisateur: ${userDoc.id} (${userData.email || 'N/A'})`);
        console.log(`   Actuel   : BAL=${currentTotals.balance}, AFF=${currentTotals.affiliateBalance}, PEND=${currentTotals.pendingBalance}, PEND_AFF=${currentTotals.pendingAffiliateBalance}`);
        console.log(`   Théorique: BAL=${theoretical.balance}, AFF=${theoretical.affiliateBalance}, PEND=${theoretical.pendingBalance}, PEND_AFF=${theoretical.pendingAffiliateBalance}`);

        if (hasBalanceMismatch) totalMismatch++;
        if (hasCorruptedPending) corruptedPendingCount++;

        if (applyMigration) {
           console.log(`   🛠  Application de la migration pour ${userDoc.id}...`);
           await adminDb.collection('users').doc(userDoc.id).update({
             balance: theoretical.balance,
             affiliateBalance: theoretical.affiliateBalance,
             pendingBalance: theoretical.pendingBalance,
             pendingAffiliateBalance: theoretical.pendingAffiliateBalance,
           });
           console.log(`   ✅ Migration appliquée.`);
        }
      }
    }

    console.log('\n--- RAPPORT FIN DE RECONCILIATION ---');
    console.log(`Mismatches de solde principal/affilié: ${totalMismatch}`);
    console.log(`Corruptions du séquestre (Pending V1): ${corruptedPendingCount}`);
    
    if (totalMismatch === 0 && corruptedPendingCount === 0) {
      console.log('✅ Base de données complètement saine. Les soldes correspondent à l\'historique des transactions.');
    } else if (!applyMigration) {
      console.log('⚠️ Mode DRY-RUN terminé. Relancez avec applyMigration=true pour corriger.');
    } else {
      console.log('✅ Mode MIGRATION terminé. Tous les comptes ont été réconciliés.');
    }

  } catch (err) {
    console.error('Erreur lors de la réconciliation:', err);
  }
}

// Lancement (passer true pour écrire dans la base de données)
const runMigration = process.argv.includes('--apply');
runReconciliation(runMigration).then(() => process.exit(0));
