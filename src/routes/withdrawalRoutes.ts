export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
}

export const withdrawalRoutes = {
  requestWithdrawal: async (_amount: number, _pin: string): Promise<WithdrawalRequest> => {
    return new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject({
          code: 'unavailable',
          message: 'Le backend de retrait n\'est pas encore branché.',
          category: 'server'
        });
      }, 1000);
    });
  },
  
  getWithdrawalStatus: async (withdrawalId: string): Promise<WithdrawalRequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: withdrawalId, amount: 0, status: 'pending' });
      }, 500);
    });
  }
};
