const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const chatCode = `
  // ==========================================
  // GOOGLE CHAT INTEGRATION
  // ==========================================
  app.post("/api/chat/create-space", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName, accessToken } = req.body;
      if (!accessToken) return res.status(401).json({ error: "Access token required" });
      
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: spaceName || 'Nouveau Groupe de Formation'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erreur Chat API");
      
      res.json({ success: true, space: data });
    } catch (e: any) {
      console.error("Google Chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/wallet/init",`;

content = content.replace(/app\.post\("\/api\/wallet\/init",/, chatCode);

fs.writeFileSync('server.ts', content);
