const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The issue was we had multiple catch blocks or a missing bracket in the fix_syntax3.cjs replacement
// Let's replace the whole app.post("/api/ai/chat" block to be sure
const blockRegex = /app\.post\("\/api\/ai\/chat", isAuthenticated, async \(req: any, res: any\) => \{[\s\S]*?res\.status\(503\)\.json\(\{ error: "L'assistant IA Mathias est actuellement très sollicité \(haute demande\)\. Veuillez réessayer dans quelques instants\." \}\);\s*\}\s*\}\);\s*/m;

const correctBlock = `app.post("/api/ai/chat", isAuthenticated, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Configuration IA manquante sur le serveur." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = \`Tu es Mathias, un tuteur IA expert et bienveillant pour la plateforme Ndara Afrique. 
Tu aides les étudiants africains à comprendre les concepts des cours (Trading, Programmation, Marketing). 
Réponds principalement en français, mais tu peux occasionnellement utiliser des expressions familières d'Afrique francophone ou en Sango / Lingala pour mettre à l'aise l'étudiant.
Sois concis, clair, et encourageant.\`;

      let contents = [];
      if (history && Array.isArray(history)) {
        contents = history.map((item: any) => ({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }]
        }));
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
           systemInstruction,
           temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(503).json({ error: "L'assistant IA Mathias est actuellement très sollicité (haute demande). Veuillez réessayer dans quelques instants." });
    }
  });\n\n`;

content = content.replace(blockRegex, correctBlock);

// Also verify there's no trailing "}" from the previous bad replace
const errRegex = /  \}\);\n\n  \}\n\n  app.post\("\/api\/ai\/grade-assignment"/m;
content = content.replace(errRegex, `  });\n\n  app.post("/api/ai/grade-assignment"`);

const errRegex2 = /res\.status\(500\)\.json\(\{ error: 'Failed to create custom token' \};\n    \}\n  \}\);\n\n  \}\n\n  app.post\("\/api\/ai\/chat"/m;
content = content.replace(/res\.status\(500\)\.json\(\{ error: 'Failed to create custom token' \};\n    \}\n  \}\);\n\n  \}/m, `res.status(500).json({ error: 'Failed to create custom token' });\n    }\n  });`);

fs.writeFileSync('server.ts', content);
