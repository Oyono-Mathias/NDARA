const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let code = fs.readFileSync(file, 'utf8');

const ambassadorWalletRoutes = `
  // Ambassador Wallet API (Phase 5)
  app.post("/api/wallet/ambassador-withdraw", isAuthenticated, async (req: any, res: any) => {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body;
      if (!amount || !paymentMethod || !paymentDetails) {
        return res.status(400).json({error: "Missing fields"});
      }

      const { requestAmbassadorWithdrawal } = await import("./src/lib/ambassadorWalletProcessor.js");
      const result = await requestAmbassadorWithdrawal({
        ambassadorUid: req.user.uid,
        amount: Number(amount),
        paymentMethod,
        paymentDetails
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.reason });
      }

      res.json({ success: true, requestId: result.requestId });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });

  app.post("/api/wallet/ambassador-withdraw-action", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { requestId, action, note } = req.body;
      if (!requestId || !action) {
        return res.status(400).json({error: "Missing fields"});
      }

      const { processAmbassadorWithdrawal } = await import("./src/lib/ambassadorWalletProcessor.js");
      const result = await processAmbassadorWithdrawal({
        requestId,
        action,
        processedBy: req.user.uid,
        note
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.reason });
      }

      res.json({ success: true });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });
`;

if (!code.includes('/api/wallet/ambassador-withdraw')) {
    code = code.replace(
        '  // Wallet Security API',
        ambassadorWalletRoutes + '\n  // Wallet Security API'
    );
    fs.writeFileSync(file, code);
    console.log("Ambassador wallet routes added to server.ts");
} else {
    console.log("Routes already exist");
}
