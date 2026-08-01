const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let code = fs.readFileSync(file, 'utf8');

const refundRoute = `
  // Refund (Phase 4 testing)
  app.post("/api/wallet/refund", isAuthenticated, async (req: any, res: any) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) return res.status(400).json({error: "transactionId required"});

      // Process commission cancellation
      const { cancelAmbassadorCommission } = await import("./src/lib/commissionEngine.js");
      const result = await cancelAmbassadorCommission(transactionId);
      
      if (!result || !result.success) {
        return res.status(400).json({ error: result?.reason || "Failed to cancel commission" });
      }

      res.json({ success: true, message: "Refund processed and commission cancelled" });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });
`;

if (!code.includes('/api/wallet/refund')) {
    code = code.replace(
        '  // Wallet Security API',
        refundRoute + '\n  // Wallet Security API'
    );
    fs.writeFileSync(file, code);
    console.log("Refund route added to server.ts");
} else {
    console.log("Route already exists");
}
