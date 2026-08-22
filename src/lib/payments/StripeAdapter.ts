import { Request } from "express";
import { PaymentAdapter, PaymentIntentResponse, WebhookResult, RefundResponse } from "./PaymentAdapter.js";
import { logger } from "../logger.js";
import Stripe from "stripe";

export class StripeAdapter implements PaymentAdapter {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    }
  }

  getName() { return "stripe"; }

  isEnabled() { return process.env.STRIPE_ENABLED === "true"; }

  async createIntent(amount: number, currency: string, txRef: string, metadata: any, customerData: any): Promise<PaymentIntentResponse> {
    if (!this.stripe) throw new Error("Stripe is not configured");

    const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        metadata: { txRef, userId: metadata.userId, type: metadata.type }
    });

    return {
        success: true, transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined, status: 'pending'
    };
  }

  async verifyWebhook(req: Request): Promise<WebhookResult> {
    if (!this.stripe || !req.headers['stripe-signature']) {
        return { isSupported: false, isValid: false };
    }

    try {
        const event = this.stripe.webhooks.constructEvent(
            req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as any;
            return {
                isSupported: true, isValid: true, provider: this.getName(),
                txRef: paymentIntent.metadata.txRef, amount: paymentIntent.amount,
                status: 'completed', rawEvent: event
            };
        }
        return { isSupported: true, isValid: true, provider: this.getName(), status: 'pending', rawEvent: event };
    } catch (err: any) {
        logger.error("Stripe Webhook Error:", err.message);
        return { isSupported: true, isValid: false, error: err.message };
    }
  }

  async refund(txRef: string, amount: number, reason: string): Promise<RefundResponse> {
    if (!this.stripe) throw new Error("Stripe is not configured");
    const intents = await this.stripe.paymentIntents.search({ query: `metadata['txRef']:'${txRef}'` });

    if (intents.data.length > 0) {
        await this.stripe.refunds.create(
            { payment_intent: intents.data[0].id, reason: 'requested_by_customer' },
            { idempotencyKey: 'refund_' + txRef }
        );
        return { success: true, refundId: 'refund_' + txRef };
    } else {
        throw new Error("Transaction introuvable dans Stripe");
    }
  }
}
