const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const { code, camp } = req.body;')) {
    code = code.replace(
        "const { code } = req.body;",
        "const { code, camp } = req.body;"
    );
    
    // Search for where referral finishes successfully to add the conversion track.
    // It is in the try block of app.post("/api/ambassador/process-referral"
    // Let's replace the response logic
    code = code.replace(
        'res.json({ success: true, message: "Parrainage validé" });',
        `
        // Track signup conversion for marketing
        try {
           const { MarketingRoutes } = require("./src/lib/marketingBackend.js");
           await MarketingRoutes.trackConversion({
             body: { ref: code, camp, type: 'signup' }
           }, { json: () => {} });
        } catch(e) { console.error('Erreur marketing conversion', e); }
        
        res.json({ success: true, message: "Parrainage validé" });`
    );
    fs.writeFileSync(file, code);
}
