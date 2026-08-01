const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldChatApi = `  app.post("/api/chat/create-space", isAuthenticated, async (req: any, res: any) => {
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

  app.post("/api/chat/add-member", isAuthenticated, async (req: any, res: any) => {
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
  });`;

const newChatApi = `  app.post("/api/chat/create-space", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName } = req.body;
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection("platform").doc("config").get();
      const accessToken = configDoc.data()?.google_workspace_token;
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

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

  app.post("/api/chat/add-member", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName, email } = req.body;
      if (!spaceName || !email) return res.status(400).json({ error: "spaceName and email required" });
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection("platform").doc("config").get();
      const accessToken = configDoc.data()?.google_workspace_token;
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

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
  });`;

if(content.includes(oldChatApi)) {
  content = content.replace(oldChatApi, newChatApi);
  fs.writeFileSync('server.ts', content);
  console.log("Chat API patched in server.ts");
} else {
  console.log("Could not find the old API in server.ts");
}
