import { logger } from '../lib/logger';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key, { apiVersion: '2023-10-16' });
    }
  }
  return stripeClient;
}

// Interface for standardized payment handling
export interface PaymentIntentResponse {
  success: boolean;
  transactionId?: string;
  clientSecret?: string; // For Stripe
  paymentUrl?: string; // For redirect based APIs like Flutterwave/MoMo
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

/**
 * Mobile Money Implementation (Generic African Provider e.g. Flutterwave / Paystack)
 * Simulates a direct API call to a Mobile Money aggregator.
 */
export async function createMobileMoneyIntent(
  amount: number,
  currency: 'XAF' | 'XOF',
  customerPhone: string,
  customerEmail: string,
  txRef: string,
  provider: 'MTN' | 'ORANGE'
): Promise<PaymentIntentResponse> {
  // In a real application, we would call the Flutterwave/Paystack/Campay API here.
  // We'll build the real structural fetch expecting an API key.
  const apiKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!apiKey) {
    console.warn(`[Mobile Money] No API key, simulating success for ${provider} payment of ${amount} ${currency}`);
    // Simulated fallback for dev/testing without keys
    return {
      success: true,
      transactionId: `tx_sim_${Date.now()}`,
      paymentUrl: `https://mock.payment.url/pay/${txRef}`,
      status: 'pending' // Wait for webhook / USSD push
    };
  }

  // Example real API call to Flutterwave Charge API
  try {
    const response = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_franco', {
      method: 'POST',
      credentials: 'include',
        
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: amount,
        currency: currency,
        network: provider, // 'MTN' or 'ORANGE'
        email: customerEmail,
        phone_number: customerPhone,
        redirect_url: process.env.PUBLIC_URL + '/payment/callback',
      })
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      return {
        success: true,
        transactionId: data.data.id.toString(),
        paymentUrl: data.data.meta?.authorization?.redirect_url,
        status: 'pending'
      };
    } else {
      throw new Error(data.message || 'Mobile Money charge failed');
    }
  } catch (error: any) {
    logger.error('Mobile Money API Error:', error);
    return {
      success: false,
      status: 'failed',
      error: error.message
    };
  }
}
