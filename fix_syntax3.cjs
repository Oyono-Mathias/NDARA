const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /  \}\);\n\n \n      \}\n\n      const ai = new GoogleGenAI\(\{ apiKey \}\);/;

content = content.replace(regex, `  });

  app.post("/api/ai/chat", isAuthenticated, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Configuration IA manquante sur le serveur." });
      }

      const ai = new GoogleGenAI({ apiKey });`);

fs.writeFileSync('server.ts', content);
