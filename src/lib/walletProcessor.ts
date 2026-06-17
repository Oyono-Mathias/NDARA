import { doc, runTransaction, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { serverDb } from '../firebaseServer';
import { WalletTransaction, TransactionType, TransactionStatus } from '../types/wallet';

async function logSecurityAlert(details: string, action: string) {
  try {
    console.error(`[CRITICAL SECURITY ALERT] ${details}`);
    await addDoc(collection(serverDb, 'system_logs'), {
      eventType: 'SECURITY_ALERT',
      details: details,
      action: action,
      timestamp: Timestamp.now(),
      level: 'critical'
    });
  } catch(e) {
    console.error('Failed to log security alert', e);
  }
}

/**
 * Ensures wallet balance keys exist on a user's document.
 */
export async function ensureWalletInitialized(userId: string) {
  const userRef = doc(serverDb, 'users', userId);
  
  await runTransaction(serverDb, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Utilisateur ${userId} introuvable.`);
    }
    
    const data = userSnap.data();
    const balance = data.balance !== undefined ? data.balance : 0;
    const affiliateBalance = data.affiliateBalance !== undefined ? data.affiliateBalance : 0;
    const pendingBalance = data.pendingBalance !== undefined ? data.pendingBalance : 0;
    const pendingAffiliateBalance = data.pendingAffiliateBalance !== undefined ? data.pendingAffiliateBalance : 0;
    
    transaction.update(userRef, {
      balance,
      affiliateBalance,
      pendingBalance,
      pendingAffiliateBalance
    });
  });
}

/**
 * Safely deposits money into a user's main available balance.
 */
export async function depositFunds(userId: string, amount: number, description = 'Rechargement de compte', externalTransactionId?: string) {
  if (amount <= 0) throw new Error('Le montant du rechargement doit être supérieur à 0.');
  
  const userRef = doc(serverDb, 'users', userId);
  
  return await runTransaction(serverDb, async (transaction) => {
    const txRef = externalTransactionId ? doc(serverDb, 'users', userId, 'transactions', externalTransactionId) : doc(collection(serverDb, 'users', userId, 'transactions'));
    
    if (externalTransactionId) {
      const existingTxSnap = await transaction.get(txRef);
      if (existingTxSnap.exists()) {
         const userSnap = await transaction.get(userRef);
         return { success: true, nextBalance: userSnap.data()?.balance, transactionId: txRef.id, idempotent: true };
      }
    }

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Utilisateur non trouvé.');
    }
    
    const userData = userSnap.data();
    const currentBalance = userData.balance || 0;
    const nextBalance = currentBalance + amount;
    
    // Update user balances
    transaction.update(userRef, { 
      balance: nextBalance 
    });
    
    // Write ledger transaction
    const txObj: WalletTransaction = {
      id: txRef.id,
      userId,
      type: 'deposit',
      amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description,
    };
    
    transaction.set(txRef, txObj);
    return { success: true, nextBalance, transactionId: txRef.id };
  });
}

/**
 * Securely transfers funds between two users' main balances.
 */
export async function transferFunds(senderId: string, receiverUsernameOrId: string, amount: number, description = 'Transfert entre utilisateurs') {
  if (amount <= 0) throw new Error('Le montant du transfert doit être supérieur à 0.');
  
  const senderRef = doc(serverDb, 'users', senderId);
  const usersColl = collection(serverDb, 'users');
  
  return await runTransaction(serverDb, async (transaction) => {
    // 1. Get Sender
    const senderSnap = await transaction.get(senderRef);
    if (!senderSnap.exists()) {
      throw new Error('Expéditeur non trouvé.');
    }
    
    const senderData = senderSnap.data();
    const senderBalance = senderData.balance || 0;
    if (senderBalance < amount) {
      throw new Error(`Solde insuffisant. Votre solde disponible est de ${senderBalance.toLocaleString()} F.`);
    }
    
    // 2. Resolve Receiver
    let receiverId = receiverUsernameOrId;
    let receiverRef = doc(serverDb, 'users', receiverId);
    let receiverSnap = await transaction.get(receiverRef);
    
    if (!receiverSnap.exists()) {
      // Try resolving by username
      const q = query(usersColl, where('username', '==', receiverUsernameOrId));
      const qSnap = await getDocs(q);
      if (qSnap.empty) {
        throw new Error(`Destinataire '${receiverUsernameOrId}' introuvable dans le réseau Ndara.`);
      }
      const receiverDoc = qSnap.docs[0];
      receiverId = receiverDoc.id;
      receiverRef = doc(serverDb, 'users', receiverId);
      receiverSnap = await transaction.get(receiverRef);
    }
    
    if (senderId === receiverId) {
      throw new Error('Vous ne pouvez pas vous envoyer des fonds à vous-même.');
    }
    
    const receiverData = receiverSnap.data()!;
    const receiverBalance = receiverData.balance || 0;
    
    // 3. Atomically update balances
    const nextSenderBalance = senderBalance - amount;
    if (nextSenderBalance < 0) {
       logSecurityAlert(`Solde expéditeur négatif évité: UID=${senderId}, Amount: ${amount}`, 'TRANSFER_BLOCKED');
       throw new Error(`Solde insuffisant (Alerte de Sécurité).`);
    }
    
    transaction.update(senderRef, { balance: nextSenderBalance });
    transaction.update(receiverRef, { balance: receiverBalance + amount });
    
    // 4. Log transaction entries for both parties
    const senderTxRef = doc(collection(serverDb, 'users', senderId, 'transactions'));
    const receiverTxRef = doc(collection(serverDb, 'users', receiverId, 'transactions'));
    
    const senderTx: WalletTransaction = {
      id: senderTxRef.id,
      userId: senderId,
      type: 'transfer_send',
      amount: -amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description,
      relatedUserId: receiverId
    };
    
    const receiverTx: WalletTransaction = {
      id: receiverTxRef.id,
      userId: receiverId,
      type: 'transfer_receive',
      amount: amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description,
      relatedUserId: senderId
    };
    
    transaction.set(senderTxRef, senderTx);
    transaction.set(receiverTxRef, receiverTx);
    
    return { success: true, senderNextBalance: senderBalance - amount, transactionId: senderTxRef.id };
  });
}

/**
 * Purchases a course with atomic 10% affiliate parrainage and 14-days escrow rules.
 */
export async function purchaseCourseWithEscrow(
  studentId: string, 
  price: number, 
  courseId: string, 
  courseTitle: string, 
  sellerId: string,
  purchaseId?: string
) {
  if (price <= 0) throw new Error('Le prix du cours doit être un montant positif.');
  
  const studentRef = doc(serverDb, 'users', studentId);
  const sellerRef = doc(serverDb, 'users', sellerId);
  
  return await runTransaction(serverDb, async (transaction) => {
    // 1. Get student profile & balance
    const studentTxRef = purchaseId ? doc(serverDb, 'users', studentId, 'transactions', purchaseId) : doc(collection(serverDb, 'users', studentId, 'transactions'));
    
    if (purchaseId) {
      const existingTx = await transaction.get(studentTxRef);
      if (existingTx.exists()) {
         return { success: true, idempotent: true };
      }
    }

    const studentSnap = await transaction.get(studentRef);
    if (!studentSnap.exists()) {
      throw new Error('Profil de l\'étudiant introuvable.');
    }
    
    const studentData = studentSnap.data();
    const studentBalance = studentData.balance || 0;
    if (studentBalance < price) {
      throw new Error(`Solde Ndara insuffisant. Le cours coûte ${price.toLocaleString()} F, et votre solde disponible est de ${studentBalance.toLocaleString()} F. Veuillez recharger votre portefeuille.`);
    }
    
    // Check if there is an ambassador/referrer
    const referrerId = studentData.referredBy || null;
    
    // Calculate shares:
    // rule: 10% parrainage rule
    let affiliateAmount = 0;
    let sellerAmount = price;
    
    let referrerRef = null;
    let referrerSnap = null;
    
    if (referrerId && referrerId !== sellerId && referrerId !== studentId) {
      referrerRef = doc(serverDb, 'users', referrerId);
      referrerSnap = await transaction.get(referrerRef);
      if (referrerSnap.exists()) {
        affiliateAmount = Math.round(price * 0.10);
        sellerAmount = price - affiliateAmount;
      }
    }
    
    // 2. Get Seller profile
    const sellerSnap = await transaction.get(sellerRef);
    if (!sellerSnap.exists()) {
      throw new Error(`Profil formateur introuvable (${sellerId}).`);
    }
    const sellerData = sellerSnap.data();
    
    // 3. Update Student Balance (deduct primary price)
    const finalStudentBalance = studentBalance - price;
    
    if (finalStudentBalance < 0) {
      logSecurityAlert(`Solde étudiant négatif évité: UID=${studentId}, Prix=${price}, Solde=${studentBalance}`, 'COURSE_PURCHASE_BLOCKED');
      throw new Error(`Solde Ndara insuffisant (Alerte Sécurité).`);
    }

    transaction.update(studentRef, {
      balance: finalStudentBalance
    });
    
    // 4. Update Seller Pending Balance (course sales go to 14-day escrow pendingBalance)
    const finalSellerPending = (sellerData.pendingBalance || 0) + sellerAmount;
    transaction.update(sellerRef, {
      pendingBalance: finalSellerPending
    });
    
    // 5. Update Referrer Pending Balance if applicable
    if (referrerRef && referrerSnap) {
      const referrerData = referrerSnap.data();
      const finalReferrerAffiliatePending = (referrerData.pendingAffiliateBalance || 0) + affiliateAmount;
      
      // Update stats
      const affStats = referrerData.affiliateStats || { clicks: 0, registrations: 0, sales: 0, earnings: 0 };
      affStats.sales = (affStats.sales || 0) + 1;
      affStats.earnings = (affStats.earnings || 0) + affiliateAmount;
      
      transaction.update(referrerRef, {
        pendingAffiliateBalance: finalReferrerAffiliatePending,
        affiliateStats: affStats
      });
    }
    
    // 6. Define Escrow clearance window
    const creationTime = new Date();
    const releaseTime = new Date(creationTime.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days escrow hold
    
    // 7. Write Ledger Transactions
    const studentTx: WalletTransaction = {
      id: studentTxRef.id,
      userId: studentId,
      type: 'purchase',
      amount: -price,
      status: 'completed',
      timestamp: creationTime.toISOString(),
      description: `Achat du syllabus: ${courseTitle}`,
      courseId
    };
    transaction.set(studentTxRef, studentTx);
    
    const sellerTxRef = purchaseId ? doc(serverDb, 'users', sellerId, 'transactions', `${purchaseId}_seller`) : doc(collection(serverDb, 'users', sellerId, 'transactions'));
    const sellerTx: WalletTransaction = {
      id: sellerTxRef.id,
      userId: sellerId,
      type: 'course_sale',
      amount: sellerAmount,
      status: 'pending',
      timestamp: creationTime.toISOString(),
      description: `Vente du syllabus parrainé: ${courseTitle}`,
      relatedUserId: studentId,
      releaseAt: releaseTime.toISOString(),
      courseId
    };
    transaction.set(sellerTxRef, sellerTx);
    
    if (referrerId && referrerRef && referrerSnap) {
      const referrerTxRef = purchaseId ? doc(serverDb, 'users', referrerId, 'transactions', `${purchaseId}_affiliate`) : doc(collection(serverDb, 'users', referrerId, 'transactions'));
      const referrerTx: WalletTransaction = {
        id: referrerTxRef.id,
        userId: referrerId,
        type: 'affiliate_payout',
        amount: affiliateAmount,
        status: 'pending',
        timestamp: creationTime.toISOString(),
        description: `Commission 10% parrainage étudiant (${studentData.fullName || 'Étudiant'}) - ${courseTitle}`,
        relatedUserId: studentId,
        releaseAt: releaseTime.toISOString(),
        courseId
      };
      transaction.set(referrerTxRef, referrerTx);
    }
    
    return { 
      success: true, 
      finalStudentBalance, 
      escrowDays: 14, 
      releaseAt: releaseTime.toISOString(),
      affiliateDistributed: affiliateAmount > 0
    };
  });
}

/**
 * Scans and releases expired pending escrow funds into available balances atomically.
 */
export async function releaseExpiredEscrows(userId: string) {
  const transactionsColl = collection(serverDb, 'users', userId, 'transactions');
  const userRef = doc(serverDb, 'users', userId);
  
  // Find pending escrow transactions which expired
  const nowStr = new Date().toISOString();
  
  // Fetch pending transactions
  const q = query(
    transactionsColl, 
    where('status', '==', 'pending')
  );
  
  const snap = await getDocs(q);
  if (snap.empty) {
    return { releasedCount: 0, msg: "Aucun fonds sous séquestre n'est prêt pour libération." };
  }
  
  let releasedCount = 0;
  let totalReleasedAmount = 0;
  
  for (const txDoc of snap.docs) {
    const tx = txDoc.data() as WalletTransaction;
    
    // Check if timeline expired
    if (tx.releaseAt && tx.releaseAt <= nowStr) {
      await runTransaction(serverDb, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) return;
        
        const freshTxSnap = await transaction.get(txDoc.ref);
        const freshTx = freshTxSnap.data() as WalletTransaction;
        if (freshTx.status !== 'pending') return; // Avoid double spend / race
        
        const userData = userSnap.data();
        const freshAmount = freshTx.amount;
        
        let updateObj: any = {};
        
        if (freshTx.type === 'affiliate_payout') {
          const currentPendingAffiliate = userData.pendingAffiliateBalance || 0;
          updateObj.pendingAffiliateBalance = Math.max(0, currentPendingAffiliate - freshAmount);
          // Add to affiliateBalance
          updateObj.affiliateBalance = (userData.affiliateBalance || 0) + freshAmount;
        } else {
          const currentPending = userData.pendingBalance || 0;
          updateObj.pendingBalance = Math.max(0, currentPending - freshAmount);
          // Add to main balance (for instructor course sales)
          updateObj.balance = (userData.balance || 0) + freshAmount;
        }
        
        // Update user balances
        transaction.update(userRef, updateObj);
        
        // Update transaction status
        transaction.update(txDoc.ref, {
          status: 'completed',
          description: `${freshTx.description} (Libération Séquestre validée après 14j)`
        });
        
        releasedCount++;
        totalReleasedAmount += freshAmount;
      });
    }
  }
  
  return { releasedCount, totalReleasedAmount };
}

/**
 * Processes a secure payout request from an instructor/ambassador.
 * Deducts the requested amount from their available balances atomically,
 * logs a pending transaction, and registers the payout request document.
 */
export async function requestPayout(
  userId: string,
  amount: number,
  provider: string,
  phone: string,
  method = 'mobile_money',
  payoutId?: string
) {
  if (amount < 5000) throw new Error('Le montant minimum de retrait est de 5 000 FCFA.');
  
  const userRef = doc(serverDb, 'users', userId);
  const payoutRequestsColl = collection(serverDb, 'payout_requests');
  
  return await runTransaction(serverDb, async (transaction) => {
    const payoutReqRef = payoutId ? doc(payoutRequestsColl, payoutId) : doc(payoutRequestsColl);
    if (payoutId) {
      const existingReq = await transaction.get(payoutReqRef);
      if (existingReq.exists()) {
        const nextBalance = (await transaction.get(userRef)).data()?.balance;
        return { success: true, payoutRequestId: existingReq.id, transactionId: existingReq.data().transactionId, nextBalance, idempotent: true };
      }
    }

    // 1. Get user document
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Utilisateur non trouvé.');
    }
    
    const userData = userSnap.data();
    const currentBalance = userData.balance || 0;
    const currentAffiliate = userData.affiliateBalance || 0;
    const totalAvailable = currentBalance + currentAffiliate;
    
    if (totalAvailable < amount) {
      throw new Error(`Solde withdrawable insuffisant. Disponible: ${totalAvailable.toLocaleString()} F, Demandé: ${amount.toLocaleString()} F.`);
    }
    
    // Determine balance deductions
    let nextBalance = currentBalance;
    let nextAffiliate = currentAffiliate;
    let deductedFromAffiliate = 0;
    let deductedFromBalance = 0;
    
    if (currentBalance >= amount) {
      nextBalance = currentBalance - amount;
      deductedFromBalance = amount;
    } else {
      deductedFromBalance = currentBalance;
      const remainder = amount - currentBalance;
      nextBalance = 0;
      nextAffiliate = currentAffiliate - remainder;
      deductedFromAffiliate = remainder;
    }
    
    // Update user document
    if (nextBalance < 0 || nextAffiliate < 0) {
      logSecurityAlert(`Solde négatif évité lors d'un retrait: UID=${userId}, Balance: ${nextBalance}, Affiliate: ${nextAffiliate}`, 'PAYOUT_BLOCKED');
      throw new Error(`Erreur de retrait - Sécurité système.`);
    }

    transaction.update(userRef, {
      balance: nextBalance,
      affiliateBalance: nextAffiliate
    });
    
    // Create new transaction document in user's subcollection
    const txRef = doc(collection(serverDb, 'users', userId, 'transactions'));
    const txObj: WalletTransaction = {
      id: txRef.id,
      userId,
      type: 'affiliate_payout', // represents payout / withdrawal
      amount: -amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: `Retrait Mobile Money (${provider.toUpperCase()}) en cours d'audit de sécurité.`,
    };
    transaction.set(txRef, txObj);
    
    // Create request document in payout_requests collection
    const payoutReqObj = {
      id: payoutReqRef.id,
      instructorId: userId,
      requesterId: userId,
      amount,
      provider,
      phone,
      method,
      status: 'pending',
      transactionId: txRef.id,
      deductedFromBalance,
      deductedFromAffiliate,
      createdAt: Timestamp.now()
    };
    transaction.set(payoutReqRef, payoutReqObj);
    
    return {
      success: true,
      payoutRequestId: payoutReqRef.id,
      transactionId: txRef.id,
      nextBalance: nextBalance + nextAffiliate
    };
  });
}

/**
 * Approves (completed) or rejects (failed/refunded) a pending payout request atomically.
 */
export async function processApprovedPayout(requestId: string, status: 'completed' | 'rejected') {
  const payoutReqRef = doc(serverDb, 'payout_requests', requestId);
  
  return await runTransaction(serverDb, async (transaction) => {
    // 1. Get payout request
    const payoutSnap = await transaction.get(payoutReqRef);
    if (!payoutSnap.exists()) {
      throw new Error('Demande de retrait introuvable.');
    }
    
    const payoutData = payoutSnap.data();
    if (payoutData.status !== 'pending') {
      throw new Error(`Cette demande de retrait n'est plus en attente (statut actuel: ${payoutData.status}).`);
    }
    
    const { instructorId, amount, transactionId, provider } = payoutData;
    const userRef = doc(serverDb, 'users', instructorId);
    
    // Resolve transaction ref inside user transactions subcollection
    const userTxRef = doc(serverDb, 'users', instructorId, 'transactions', transactionId);
    
    // 2. Fetch User and Transaction
    const userSnap = await transaction.get(userRef);
    const userTxSnap = await transaction.get(userTxRef);
    
    if (status === 'completed') {
      // Mark request as completed
      transaction.update(payoutReqRef, { status: 'completed' });
      
      // Update transaction log to completed
      if (userTxSnap.exists()) {
        transaction.update(userTxRef, { 
          status: 'completed',
          description: `Retrait Mobile Money (${provider.toUpperCase()}) d'un montant de ${amount.toLocaleString()} FCFA complété avec succès.`
        });
      }
      
      return { success: true, status: 'completed', amount };
    } else {
      // Rejection: refund deducted funds back to their respective origin balances
      transaction.update(payoutReqRef, { status: 'rejected' });
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const deductedBalance = payoutData.deductedFromBalance || 0;
        const deductedAffiliate = payoutData.deductedFromAffiliate || 0;
        
        transaction.update(userRef, { 
          balance: (userData.balance || 0) + deductedBalance,
          affiliateBalance: (userData.affiliateBalance || 0) + deductedAffiliate
        });
      }
      
      if (userTxSnap.exists()) {
        transaction.update(userTxRef, { 
          status: 'failed',
          description: `Retrait Mobile Money (${provider.toUpperCase()}) de ${amount.toLocaleString()} FCFA REFUSÉ & REMBOURSÉ.`
        });
      }
      
      return { success: true, status: 'rejected', amount, refunded: true };
    }
  });
}

/**
 * Atomic purchase of a course trading license (Bourse Savoir).
 * Checks buyer's balance (price + 2% platform fee), transfers license cost to seller/creator,
 * records ownership in 'licenses' collection, and generates ledger logs.
 */
export async function purchaseBourseLicense(
  buyerId: string,
  price: number,
  courseId: string,
  courseTitle: string,
  sellerId = 'inst_mbarga' // default seller UID corresponding to Dr. Alain Mbarga
) {
  if (price <= 0) throw new Error('Le prix de la licence doit être supérieur à zéro.');
  
  const buyerRef = doc(serverDb, 'users', buyerId);
  const sellerRef = doc(serverDb, 'users', sellerId);
  const platformFee = Math.round(price * 0.02); // 2% platform fee
  const totalDeduction = price + platformFee;
  
  return await runTransaction(serverDb, async (transaction) => {
    // 1. Get buyer profile & balance
    const buyerSnap = await transaction.get(buyerRef);
    if (!buyerSnap.exists()) {
      throw new Error('Votre profil utilisateur est introuvable.');
    }
    
    const buyerData = buyerSnap.data();
    const buyerBalance = buyerData.balance || 0;
    if (buyerBalance < totalDeduction) {
      throw new Error(`Solde Ndara insuffisant. La licence coûte ${price.toLocaleString()} F et génère ${platformFee.toLocaleString()} F de frais de transfert (Total: ${totalDeduction.toLocaleString()} F). Votre solde disponible est de ${buyerBalance.toLocaleString()} F. Veuillez charger votre wallet.`);
    }
    
    // 2. Fetch seller profile to get their current balance
    const sellerSnap = await transaction.get(sellerRef);
    let sellerBalance = 0;
    if (sellerSnap.exists()) {
      sellerBalance = sellerSnap.data().balance || 0;
    }
    
    // 3. Deduct total price + fee from buyer
    const nextBuyerBalance = buyerBalance - totalDeduction;
    if (nextBuyerBalance < 0) {
      logSecurityAlert(`Solde négatif évité pour achat licence: UID=${buyerId}`, 'PURCHASE_LICENSE_BLOCKED');
      throw new Error(`Solde insuffisant (Alerte Sécurité).`);
    }

    transaction.update(buyerRef, {
      balance: nextBuyerBalance
    });
    
    // 4. Update seller's balance
    if (sellerSnap.exists()) {
      transaction.update(sellerRef, {
        balance: sellerBalance + price
      });
    } else {
      // Create seller dynamically if not present
      transaction.set(sellerRef, {
        uid: sellerId,
        fullName: 'Dr. Alain Mbarga',
        role: 'expert',
        balance: price,
        createdAt: new Date().toISOString()
      });
    }
    
    // 5. Create Ledger transaction for the buyer
    const buyerTxRef = doc(collection(serverDb, 'users', buyerId, 'transactions'));
    const buyerTx: WalletTransaction = {
      id: buyerTxRef.id,
      userId: buyerId,
      type: 'purchase',
      amount: -totalDeduction,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Achat de licence de revente: ${courseTitle} (+2% frais de transfert)`,
      courseId
    };
    transaction.set(buyerTxRef, buyerTx);
    
    // 6. Create Ledger transaction for the seller
    const sellerTxRef = doc(collection(serverDb, 'users', sellerId, 'transactions'));
    const sellerTx: WalletTransaction = {
      id: sellerTxRef.id,
      userId: sellerId,
      type: 'deposit',
      amount: price,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Vente de licence: ${courseTitle}`,
      relatedUserId: buyerId,
      courseId
    };
    transaction.set(sellerTxRef, sellerTx);
    
    // 7. Write a license document to the 'licenses' collection to query owned licenses of a user
    const licenseRef = doc(collection(serverDb, 'licenses'));
    transaction.set(licenseRef, {
      id: licenseRef.id,
      courseId,
      courseTitle,
      ownerId: buyerId,
      previousOwnerId: sellerId,
      purchasePrice: price,
      createdAt: new Date().toISOString()
    });
    
    return {
      success: true,
      buyerNextBalance: nextBuyerBalance,
      licenseId: licenseRef.id,
      transactionId: buyerTxRef.id
    };
  });
}
