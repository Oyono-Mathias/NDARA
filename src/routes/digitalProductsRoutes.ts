export const digitalProductsRoutes = {
  checkAccess: async (_productId: string): Promise<{ hasAccess: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ hasAccess: false }), 500);
    });
  }
};
