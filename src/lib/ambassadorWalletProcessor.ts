import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function getOrCreateAmbassadorWallet(ambassadorUid: string) {
  const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
  const docSnap = await walletRef.get();
  
  if (docSnap.exists) {
    return { success: true, wallet: docSnap.data() };
  } else {
    const newWallet = {
      walletId: ambassadorUid,
      ambassadorUid: ambassadorUid,
      availableBalance: 0,
      pendingBalance: 0,
      paidBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalPendingWithdrawals: 0,
      currency: 'XAF',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    await walletRef.set(newWallet);
    return { success: true, wallet: newWallet };
  }
}

export async function requestAmbassadorWithdrawal({
  ambassadorUid,
  amount,
  paymentMethod,
  paymentDetails
}: {
  ambassadorUid: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: string;
}) {
  try {
    if (amount < 5000) return { success: false, reason: "Minimum de retrait: 5000 XAF" };
    
    // Check if account is suspended
    const ambRef = adminDb.collection('ambassadors').doc(ambassadorUid);
    const ambSnap = await ambRef.get();
    if (!ambSnap.exists || ambSnap.data()?.status !== 'active') {
        return { success: false, reason: "Compte ambassadeur inactif" };
    }

    const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
    const requestRef = adminDb.collection('withdraw_requests').doc();

    await adminDb.runTransaction(async (t) => {
      const walletDoc = await t.get(walletRef);
      if (!walletDoc.exists) throw new Error("Wallet not found");
      
      const wallet = walletDoc.data();
      if ((wallet?.availableBalance || 0) < amount) {
        throw new Error("Solde insuffisant");
      }

      // Decrement available, increment pending
      t.update(walletRef, {
        availableBalance: FieldValue.increment(-amount),
        totalPendingWithdrawals: FieldValue.increment(amount),
        pendingBalance: FieldValue.increment(amount), // if requested
        updatedAt: FieldValue.serverTimestamp()
      });

      t.set(requestRef, {
        requestId: requestRef.id,
        ambassadorUid,
        walletId: ambassadorUid,
        amount,
        fees: 0,
        netAmount: amount,
        paymentMethod,
        paymentDetails,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp()
      });

      const logRef = adminDb.collection('wallet_logs').doc();
      t.set(logRef, {
        walletId: ambassadorUid,
        ambassadorUid,
        type: 'withdrawal_request',
        description: 'Demande de retrait initiée',
        amount: -amount,
        status: 'pending',
        reference: requestRef.id,
        origin: 'user',
        createdAt: FieldValue.serverTimestamp()
      });
    });

    return { success: true, requestId: requestRef.id };
  } catch (error: any) {
    console.error("requestAmbassadorWithdrawal Error:", error);
    return { success: false, reason: error.message };
  }
}

export async function processAmbassadorWithdrawal({
  requestId,
  action, // 'approve' | 'reject' | 'pay'
  processedBy,
  note
}: {
  requestId: string;
  action: string;
  processedBy: string;
  note?: string;
}) {
  try {
    const requestRef = adminDb.collection('withdraw_requests').doc(requestId);
    
    await adminDb.runTransaction(async (t) => {
      const reqDoc = await t.get(requestRef);
      if (!reqDoc.exists) throw new Error("Request not found");
      
      const reqData = reqDoc.data();
      if (reqData?.status === 'paid' || reqData?.status === 'rejected') {
        throw new Error("Request already processed");
      }
      
      const walletRef = adminDb.collection('wallets').doc(reqData!.ambassadorUid);
      const amount = reqData!.amount;

      if (action === 'approve') {
        t.update(requestRef, {
          status: 'approved',
          validatedAt: FieldValue.serverTimestamp(),
          processedBy,
          internalNote: note || ''
        });
        
        const logRef = adminDb.collection('wallet_logs').doc();
        t.set(logRef, {
            walletId: reqData!.ambassadorUid,
            ambassadorUid: reqData!.ambassadorUid,
            type: 'withdrawal_approved',
            description: 'Demande de retrait approuvée',
            amount: 0,
            status: 'completed',
            reference: requestId,
            origin: 'admin',
            createdAt: FieldValue.serverTimestamp()
        });
      } 
      else if (action === 'reject') {
        // Refund the wallet
        t.update(walletRef, {
            availableBalance: FieldValue.increment(amount),
            totalPendingWithdrawals: FieldValue.increment(-amount),
            pendingBalance: FieldValue.increment(-amount),
            updatedAt: FieldValue.serverTimestamp()
        });

        t.update(requestRef, {
          status: 'rejected',
          processedAt: FieldValue.serverTimestamp(),
          processedBy,
          internalNote: note || ''
        });

        const logRef = adminDb.collection('wallet_logs').doc();
        t.set(logRef, {
            walletId: reqData!.ambassadorUid,
            ambassadorUid: reqData!.ambassadorUid,
            type: 'withdrawal_rejected',
            description: 'Demande de retrait rejetée (Rembsourée)',
            amount: amount,
            status: 'completed',
            reference: requestId,
            origin: 'admin',
            createdAt: FieldValue.serverTimestamp()
        });
      }
      else if (action === 'pay') {
        t.update(walletRef, {
            totalPendingWithdrawals: FieldValue.increment(-amount),
            pendingBalance: FieldValue.increment(-amount),
            paidBalance: FieldValue.increment(amount),
            totalWithdrawn: FieldValue.increment(amount),
            updatedAt: FieldValue.serverTimestamp()
        });

        t.update(requestRef, {
          status: 'paid',
          processedAt: FieldValue.serverTimestamp(),
          processedBy,
          internalNote: note || ''
        });

        const logRef = adminDb.collection('wallet_logs').doc();
        t.set(logRef, {
            walletId: reqData!.ambassadorUid,
            ambassadorUid: reqData!.ambassadorUid,
            type: 'withdrawal_paid',
            description: 'Retrait payé',
            amount: -amount,
            status: 'completed',
            reference: requestId,
            origin: 'admin',
            createdAt: FieldValue.serverTimestamp()
        });
      }
    });

    return { success: true };
  } catch(error: any) {
    console.error("processAmbassadorWithdrawal Error:", error);
    return { success: false, reason: error.message };
  }
}
