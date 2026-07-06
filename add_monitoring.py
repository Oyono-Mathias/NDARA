import re

with open('server.ts', 'r') as f:
    content = f.read()

middleware_code = """
// Monitoring middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMsg = `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`;
        if (duration > 1000) {
            console.warn(`[SLOW_REQUEST] ${logMsg}`);
            // TODO: Ideally we should log to Firestore audit_logs asynchronously
            try {
                const { adminDb } = require('./src/lib/firebaseAdmin.js');
                adminDb.collection('audit_logs').add({
                    action: 'SLOW_REQUEST',
                    method: req.method,
                    path: req.originalUrl,
                    duration,
                    statusCode: res.statusCode,
                    timestamp: new Date()
                });
            } catch(e) {}
        } else if (res.statusCode >= 400) {
            console.error(`[ERROR_REQUEST] ${logMsg}`);
        } else {
            console.log(`[REQUEST] ${logMsg}`);
        }
    });
    next();
});
"""

# Insert right after const app = express();
if "// Monitoring middleware" not in content:
    content = content.replace("const app = express();", f"const app = express();\n{middleware_code}")
    with open('server.ts', 'w') as f:
        f.write(content)
