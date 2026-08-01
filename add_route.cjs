const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let code = fs.readFileSync(file, 'utf8');

const newRoute = `
  // ==========================================
  // GOOGLE MEET (LIVE SESSIONS)
  // ==========================================
  app.post("/api/admin/meet/create", isAuthenticated, async (req, res) => {
    try {
      const { googleToken } = req.body;
      if (!googleToken) return res.status(400).json({ error: "Missing googleToken" });
      
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${googleToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "Error creating meet" });
      }
      
      res.json({ meetingUri: data.meetingUri, space: data.name });
    } catch (error) {
      console.error("Meet error:", error);
      res.status(500).json({ error: error.message });
    }
  });
`;

if (!code.includes('/api/admin/meet/create')) {
    code = code.replace(
        '  // ==========================================\n  // GOOGLE DRIVE EXPORT INTEGRATION',
        newRoute + '\n  // ==========================================\n  // GOOGLE DRIVE EXPORT INTEGRATION'
    );
    fs.writeFileSync(file, code);
    console.log("Route added");
} else {
    console.log("Route already exists");
}
