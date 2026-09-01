export const walletRoutes = {
  getWalletBalance: async (): Promise<{ balance: number; currency: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ balance: 0, currency: 'XAF' }), 500);
    });
  },

  getTransactions: async (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 500);
    });
  }
};
