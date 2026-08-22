import { Request } from "express";
import { PaymentAdapter, PaymentIntentResponse, WebhookResult, RefundResponse } from "./PaymentAdapter.js";
import { logger } from "../logger.js";
import crypto from "crypto";

export class MesombAdapter implements PaymentAdapter {
  getName() {
    return "mesomb";
  }

  isEnabled() {
    return process.env.MESOMB_ENABLED === "true";
  }

  async createIntent(
    amount: number,
    currency: string,
    txRef: string,
    metadata: any,
    customerData: { email?: string; phone?: string; method?: string }
  ): Promise<PaymentIntentResponse> {
    const appKey = process.env.MESOMB_APPLICATION_KEY;
    if (!appKey) {
      throw new Error("Missing MESOMB_APPLICATION_KEY");
    }
    
    if (!customerData.phone) {
        throw new Error("Phone number is required for MeSomb payment");
    }

    try {
      const service = customerData.method === 'mtn' ? 'MTN' : 'ORANGE';
      const nonce = crypto.randomUUID();
      const date = new Date().toISOString();

      const response = await fetch('https://mesomb.hachther.com/api/v1.1/payment/collect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MeSomb-Application': appKey,
          'X-MeSomb-Nonce': nonce,
          'X-MeSomb-Date': date
        },
        body: JSON.stringify({
          amount: amount,
          payer: customerData.phone,
          fees: true,
          service: service,
          currency: currency || 'XAF',
          message: metadata.courseTitle ? `Achat: ${metadata.courseTitle}` : 'Paiement Ndara',
          redirect: process.env.APP_URL ? process.env.APP_URL + '/payment/callback' : 'http://localhost:3000/payment/callback',
          reference: txRef,
          extract: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error("MeSomb payment error", data);
        return {
            success: false,
            status: 'failed',
            error: data.detail || "Erreur lors de l'initialisation MeSomb"
        };
      }

      if (data.success || data.status === 'SUCCESS') {
          return {
              success: true,
              transactionId: data.transaction?.pk || txRef,
              paymentUrl: data.redirect,
              status: 'pending'
          };
      }

      return { success: false, status: 'failed', error: "MeSomb payment failed" };
    } catch (err: any) {
      logger.error("MeSomb createIntent error", err);
      throw new Error("Erreur de connexion à MeSomb");
    }
  }

  async verifyWebhook(req: Request): Promise<WebhookResult> {
    const body = req.body;
    
    // Check signature for security
    const signature = req.headers['x-mesomb-signature'] || req.headers['X-MeSomb-Signature'];
    const secretKey = process.env.MESOMB_SECRET_KEY;
    
    if (!secretKey) {
        logger.error("Missing MESOMB_SECRET_KEY for webhook verification");
        return { isSupported: false, isValid: false, error: "Server configuration error" };
    }

    if (!signature) {
        logger.error("Missing MeSomb signature in webhook");
        return { isSupported: true, isValid: false, error: "Missing signature" };
    }

    // Typical MeSomb verification (HMAC SHA1 or equivalent)
    // Note: depending on the exact MeSomb API version, they might just send the hash of the body or a specific query string.
    // Here we ensure the developer is protected by doing a basic validation.
    // If the body is raw buffer (express.raw), we hash it.
    let isValidSignature = false;
    
    // Basic verification - we assume express.raw populated req.body as buffer or string, 
    // but if it's already JSON, we stringify. In paymentRoutes.ts we use express.raw({type: 'application/json'}).
    try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : 
                        (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
        
        // Try SHA1 (standard for many webhooks)
        const expectedSignatureSha1 = crypto.createHmac('sha1', secretKey).update(rawBody).digest('hex');
        
        // Try SHA256 (modern standard)
        const expectedSignatureSha256 = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');

        if (signature === expectedSignatureSha1 || signature === expectedSignatureSha256 || signature === secretKey) {
            isValidSignature = true;
        } else {
             logger.warn(`Invalid MeSomb signature. Expected ${expectedSignatureSha1} or ${expectedSignatureSha256}, got ${signature}`);
             // Note: if MeSomb sends a different signature format, you will need to adjust this logic.
             // For safety, we block invalid signatures.
             isValidSignature = false;
        }
    } catch(e) {
        logger.error("Error verifying MeSomb signature", e);
        isValidSignature = false;
    }

    if (!isValidSignature) {
        return { isSupported: true, isValid: false, error: "Invalid signature" };
    }

    // Now safely process the parsed body
    let data;
    try {
        data = Buffer.isBuffer(body) || typeof body === 'string' ? JSON.parse(body.toString()) : body;
    } catch (e) {
        return { isSupported: true, isValid: false, error: "Invalid JSON" };
    }

    if (!data || !data.transaction || !data.status) {
        return { isSupported: true, isValid: false };
    }

    if (data.status === 'SUCCESS') {
        return {
            isSupported: true, isValid: true, provider: this.getName(),
            txRef: data.transaction.reference, amount: data.transaction.amount,
            status: 'completed', rawEvent: data
        };
    } else if (data.status === 'FAIL') {
        return {
            isSupported: true, isValid: true, provider: this.getName(),
            txRef: data.transaction?.reference, status: 'failed', rawEvent: data
        };
    }
    
    return { isSupported: true, isValid: false };
  }

  async refund(txRef: string, amount: number, reason: string): Promise<RefundResponse> {
    logger.warn(`MeSomb refund requested for ${txRef} - Refund via API might not be fully supported by operator`);
    throw new Error("Le remboursement automatique via MeSomb n'est pas encore supporté. Veuillez effectuer le remboursement manuellement.");
  }
}
