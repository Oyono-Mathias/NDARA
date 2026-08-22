import { Request } from "express";
import { PaymentAdapter } from "./PaymentAdapter.js";
import { StripeAdapter } from "./StripeAdapter.js";
import { FlutterwaveAdapter } from "./FlutterwaveAdapter.js";
import { MesombAdapter } from "./MesombAdapter.js";

export class GatewayFactory {
  static adapters: PaymentAdapter[] = [
    new MesombAdapter(),
    new StripeAdapter(),
    new FlutterwaveAdapter()
  ];

  static getAdapter(method: string): PaymentAdapter {
    const defaultProvider = process.env.DEFAULT_PAYMENT_PROVIDER || 'mesomb';
    let selectedAdapterName = defaultProvider;

    if (method === 'card') {
      selectedAdapterName = 'stripe';
    } else if (method === 'mtn' || method === 'orange' || method === 'mobile_money') {
      selectedAdapterName = defaultProvider; 
    }

    const adapter = this.adapters.find(a => a.getName() === selectedAdapterName);
    if (!adapter) throw new Error(`Payment gateway '${selectedAdapterName}' not found`);
    if (!adapter.isEnabled()) throw new Error(`Payment gateway '${selectedAdapterName}' is not enabled. Please check server configuration.`);

    return adapter;
  }

  static getAdapterFromWebhook(req: Request): PaymentAdapter | null {
    if (req.headers['stripe-signature']) return this.adapters.find(a => a.getName() === 'stripe') || null;
    if (req.headers['verif-hash']) return this.adapters.find(a => a.getName() === 'flutterwave') || null;
    
    const body = req.body;
    if (req.headers['x-mesomb-signature'] || (body && body.transaction && body.status)) {
        return this.adapters.find(a => a.getName() === 'mesomb') || null;
    }
    return null;
  }
}
