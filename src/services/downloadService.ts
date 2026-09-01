export const downloadService = {
  async getSecureDownloadUrl(_productId: string): Promise<string> {
    return new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject({
          code: 'unavailable',
          message: 'Le service de téléchargement sécurisé n\'est pas encore disponible.',
          category: 'network',
          translationKey: 'errors.service_unavailable'
        });
      }, 1000);
    });
  }
};
