import re

with open('server.ts', 'r') as f:
    content = f.read()

route = """
  app.post("/api/wallet/release-escrows", isAuthenticated, async (req: any, res: any) => {
    try {
      const { releaseExpiredEscrows } = await import("./src/lib/walletProcessor.js");
      const result = await releaseExpiredEscrows(req.user.uid);
      res.json(result);
    } catch (err: any) {
      console.error("release-escrows error:", err);
      res.status(500).json({ error: err.message });
    }
  });
"""

if '"/api/wallet/release-escrows"' not in content:
    content = content.replace('app.post("/api/wallet/request-payout",', route.strip() + '\n\n  app.post("/api/wallet/request-payout",')

with open('server.ts', 'w') as f:
    f.write(content)
