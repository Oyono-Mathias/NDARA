export interface PaymentIntent {
  id: string;
  status: 'idle' | 'pending' | 'success' | 'failed' | 'cancelled' | 'requires_action';
  amount: number;
}

export const paymentRoutes = {
  createPaymentIntent: async (amount: number, _currency: string = 'XAF'): Promise<PaymentIntent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'pi_mock_' + Date.now(),
          status: 'pending',
          amount
        });
      }, 1000);
    });
  },
  
  verifyPayment: async (_paymentId: string): Promise<{ status: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'pending' });
      }, 500);
    });
  }
};
