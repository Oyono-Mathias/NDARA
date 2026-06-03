import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// Initialisation de Stripe avec la clé secrète (idéalement gérée via Google Cloud Secret Manager)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", 
});

const PLATFORM_FEE_PERCENTAGE = 0.20; // Commission de la plateforme (ex: 20%)

export const handlePaymentWebhook = onRequest(
  { secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res) => {
    // 1. Vérification de la signature du Webhook (Sécurité Zero-Trust)
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      logger.error("Signature Stripe ou Secret Webhook manquant.");
      res.status(400).send("Webhook Error: Missing signature or secret");
      return;
    }

    let event: Stripe.Event;

    try {
      // Validation cryptographique de l'origine de la requête
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      logger.error(`Erreur de validation de la signature: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Traitement exclusif des paiements validés
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extraction des métadonnées injectées lors de la création de la session
      const paymentId = session.metadata?.paymentId;
      const studentId = session.metadata?.studentId;
      const instructorId = session.metadata?.instructorId;
      const courseId = session.metadata?.courseId;

      if (!paymentId || !studentId || !instructorId || !courseId) {
        logger.error("Métadonnées manquantes dans la session Stripe.", session.metadata);
        res.status(400).send("Webhook Error: Missing metadata");
        return;
      }

      const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Conversion des centimes
      const instructorRevenue = totalAmount * (1 - PLATFORM_FEE_PERCENTAGE);

      try {
        // 2. Exécution de la Transaction Atomique (ACID)
        await db.runTransaction(async (transaction) => {
          const paymentRef = db.collection("payments").doc(paymentId);
          const enrollmentRef = db.collection("enrollments").doc(`${studentId}_${courseId}`);
          const instructorRef = db.collection("users").doc(instructorId);

          const paymentDoc = await transaction.get(paymentRef);

          if (!paymentDoc.exists) {
            throw new Error("Document de paiement introuvable.");
          }

          // 3. Gestion de l'idempotence : on s'assure de ne pas traiter le paiement deux fois
          if (paymentDoc.data()?.status === "Completed") {
            logger.info(`Idempotence: Le paiement ${paymentId} a déjà été traité.`);
            return; // Sortie silencieuse de la transaction
          }

          // A. Validation du paiement
          transaction.update(paymentRef, {
            status: "Completed",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            gatewayStatus: session.payment_status,
          });

          // B. Enregistrement / Activation de l'étudiant
          transaction.set(enrollmentRef, {
            studentId,
            instructorId,
            courseId,
            paymentId,
            status: "Active",
            progress: 0,
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true }); // Merge pour ne pas écraser une pré-inscription si existante

          // C. Incrémentation du solde de l'instructeur
          transaction.set(instructorRef, {
            soldePrincipal: admin.firestore.FieldValue.increment(instructorRevenue),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        });

        logger.info(`Transaction réussie pour le paiement ${paymentId}`);
        res.json({ received: true });
      } catch (error: any) {
        logger.error(`Erreur majeure lors de la transaction Firestore: ${error.message}`);
        res.status(500).send("Internal Server Error during transaction");
      }
    } else {
      // Log des événements non monitorés
      logger.info(`Événement non géré ignoré: ${event.type}`);
      res.json({ received: true });
    }
  }
);
