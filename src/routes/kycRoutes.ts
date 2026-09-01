export const kycRoutes = {
  submitKyc: async (_documentData: any): Promise<{ status: 'pending' }> => {
    return new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject({
          code: 'unavailable',
          message: 'Service KYC en cours d\'intégration serveur.',
          category: 'server'
        });
      }, 1000);
    });
  },

  getKycStatus: async (): Promise<{ status: 'pending' | 'verified' | 'rejected' }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'pending' }), 500);
    });
  }
};
