export type TransactionType = 'deposit' | 'purchase' | 'affiliate_payout' | 'escrow_release' | 'transfer_send' | 'transfer_receive' | 'course_sale';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: string; // ISO date string
  description: string;
  relatedUserId?: string; // e.g. the student, referrer or receiver
  releaseAt?: string; // Escrow release deadline for pending funds (14 days after creation)
  courseId?: string;
}

export interface UserWalletState {
  balance: number;
  affiliateBalance: number;
  pendingBalance: number;
}
