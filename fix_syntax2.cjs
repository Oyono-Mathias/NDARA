const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(503).json({ error: "L'assistant IA Mathias est actuellement très sollicité (haute demande). Veuillez réessayer dans quelques instants." });
    }
  });`;

const newCode = `    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(503).json({ error: "L'assistant IA Mathias est actuellement très sollicité (haute demande). Veuillez réessayer dans quelques instants." });
    }
  });`;

// There is a missing bracket in the fix_syntax.cjs
content = content.replace(/      const ai = new GoogleGenAI\(\{ apiKey \}\);/, '      const ai = new GoogleGenAI({ apiKey });');
fs.writeFileSync('server.ts', content);
