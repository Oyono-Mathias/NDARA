import { BaseModel } from './models';

export type Currency = 'XAF';
export type WalletStatus = 'active' | 'frozen';
export type TransactionType = 'deposit' | 'withdrawal' | 'p2p_send' | 'p2p_receive' | 'course_purchase' | 'fee';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Wallet extends BaseModel {
  userId: string;
  balance: number; // NOTE FINANCIÈRE : Toujours un ENTIER (XAF), jamais de décimales flottantes.
  currency: Currency;
  status: WalletStatus;
}

export interface Transaction extends BaseModel {
  userId: string;
  type: TransactionType;
  amount: number; // NOTE FINANCIÈRE : Toujours un ENTIER (XAF).
  status: TransactionStatus;
  reference?: string;
  hmacSignature?: string;
}
