import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const paymentWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const payload = req.body;

    const eventId = payload.eventId;
    const paymentId = payload.paymentId;
    const status = payload.status;
    const amount = payload.amount;
    const currency = payload.currency;
    const userId = payload.metadata?.userId;

    if (!eventId || !paymentId || !status || !amount || !userId || currency !== 'XAF') {
      res.status(400).send('Invalid payload');
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      res.status(400).send('Invalid amount');
      return;
    }

    const eventRef = db.collection('webhook_events').doc(eventId);
    const paymentRef = db.collection('payments').doc(paymentId);
    const walletRef = db.collection('wallets').doc(userId);

    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      if (eventDoc.exists) {
        return;
      }

      const paymentDoc = await transaction.get(paymentRef);
      if (!paymentDoc.exists) {
        throw new Error('Payment not found');
      }

      const paymentData = paymentDoc.data();
      if (paymentData?.status === 'success') {
        return;
      }

      if (status === 'success') {
        const walletDoc = await transaction.get(walletRef);
        const currentBalance = walletDoc.exists ? (walletDoc.data()?.balance || 0) : 0;
        
        transaction.set(walletRef, {
          balance: currentBalance + amount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      transaction.update(paymentRef, {
        status: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      transaction.set(eventRef, {
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentId: paymentId,
        status: status
      });
    });

    res.status(200).send('Webhook processed securely');

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});
