const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// There must be a missing opening bracket { for this catch block somewhere above.
// Let's replace the whole api/ai/chat and surrounding code block carefully.

const blockRegex = /app\.post\("\/api\/ai\/chat", isAuthenticated, async \(req: any, res: any\) => \{[\s\S]*?res\.status\(503\)\.json\(\{ error: "L'assistant IA Mathias est actuellement très sollicité \(haute demande\)\. Veuillez réessayer dans quelques instants\." \}\);\s*\}\s*\n\s*\}\);\s*/m;

content = content.replace(blockRegex, `app.post("/api/ai/chat", isAuthenticated, async (req: any, res: any) => {
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

      let contents: any[] = [];
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
  });\n\n`);

fs.writeFileSync('server.ts', content);
