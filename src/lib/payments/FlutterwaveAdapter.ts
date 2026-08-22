import { Request } from "express";
import { PaymentAdapter, PaymentIntentResponse, WebhookResult, RefundResponse } from "./PaymentAdapter.js";
import { logger } from "../logger.js";

export class FlutterwaveAdapter implements PaymentAdapter {
  getName() { return "flutterwave"; }

  isEnabled() { return process.env.FLUTTERWAVE_ENABLED === "true"; }

  async createIntent(amount: number, currency: string, txRef: string, metadata: any, customerData: any): Promise<PaymentIntentResponse> {
    const apiKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!apiKey) throw new Error("Flutterwave is not configured");

    const payload = {
      tx_ref: txRef, amount: amount.toString(), currency: currency,
      redirect_url: process.env.APP_URL + "/payment/callback",
      payment_options: "mobilemoneyfranco", meta: metadata,
      customer: { email: customerData.email || 'customer@ndara.com', phone_number: customerData.phone, name: "Ndara Student" },
      customizations: { title: "Ndara E-learning", description: metadata.courseTitle || "Paiement Formation" }
    };

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.status === "success" && data.data && data.data.link) {
      return { success: true, paymentUrl: data.data.link, status: 'pending' };
    }
    return { success: false, status: 'failed', error: data.message || "Erreur lors de l'initialisation Mobile Money" };
  }

  async verifyWebhook(req: Request): Promise<WebhookResult> {
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) return { isSupported: false, isValid: false };

    const body = req.body;
    const data = typeof body === 'string' ? JSON.parse(body) : body;

    if (data.event === 'charge.completed' && data.data.status === 'successful') {
        return { isSupported: true, isValid: true, provider: this.getName(), txRef: data.data.tx_ref, amount: data.data.amount, status: 'completed', rawEvent: data };
    }
    return { isSupported: true, isValid: true, provider: this.getName(), status: 'pending', rawEvent: data };
  }

  async refund(txRef: string, amount: number, reason: string): Promise<RefundResponse> {
    throw new Error("Le remboursement via Flutterwave nécessite le FLW ID. Implémentation manuelle requise.");
  }
}
