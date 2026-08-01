const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// There's a rogue "}" at line 229 and the start of the route is missing...
// Let's replace lines 228 to 264 manually
const lines = content.split('\n');
const fixedLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (i === 227) {
    fixedLines.push("  app.post('/api/ai/chat', isAuthenticated, async (req: any, res: any) => {");
    fixedLines.push("    try {");
    fixedLines.push("      const { message, history } = req.body;");
    fixedLines.push("      const { GoogleGenAI } = await import('@google/genai');");
    fixedLines.push("      const apiKey = process.env.GEMINI_API_KEY;");
    fixedLines.push("      if (!apiKey) return res.status(500).json({ error: 'Missing API key' });");
    skip = true;
  }
  
  if (i === 230) {
    skip = false;
  }

  if (!skip) {
    fixedLines.push(lines[i]);
  }
}

fs.writeFileSync('server.ts', fixedLines.join('\n'));
