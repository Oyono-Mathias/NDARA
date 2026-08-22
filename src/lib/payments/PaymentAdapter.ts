import { Request } from "express";

export interface PaymentIntentResponse {
  success: boolean;
  transactionId?: string;
  clientSecret?: string; // Stripe
  paymentUrl?: string; // Redirect based
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface WebhookResult {
  isSupported: boolean;
  isValid: boolean;
  provider?: string;
  txRef?: string;
  amount?: number;
  currency?: string;
  status?: 'completed' | 'failed' | 'pending';
  rawEvent?: any;
  error?: string; // Added to fix the build
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentAdapter {
  getName(): string;
  isEnabled(): boolean;
  
  createIntent(
    amount: number,
    currency: string,
    txRef: string,
    metadata: any,
    customerData: { email?: string; phone?: string; method?: string }
  ): Promise<PaymentIntentResponse>;

  verifyWebhook(req: Request): Promise<WebhookResult>;

  refund(txRef: string, amount: number, reason: string): Promise<RefundResponse>;
}
