const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newCode = `  app.post("/api/chat/add-member", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName, email, accessToken } = req.body;
      if (!accessToken) return res.status(401).json({ error: "Access token required" });
      if (!spaceName || !email) return res.status(400).json({ error: "spaceName and email required" });
      
      const response = await fetch(\`https://chat.googleapis.com/v1/\${spaceName}/memberships\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member: {
            name: \`users/\${email}\`,
            type: 'HUMAN'
          }
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error("Chat API Add Member Error:", data);
        throw new Error(data.error?.message || "Erreur Chat API");
      }
      
      res.json({ success: true, membership: data });
    } catch (e: any) {
      console.error("Google Chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/wallet/init",`;

content = content.replace(/  app\.post\("\/api\/wallet\/init",/, newCode);
fs.writeFileSync('server.ts', content);
