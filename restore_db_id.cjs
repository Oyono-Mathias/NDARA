const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  data.firestoreDatabaseId = "ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008";
  fs.writeFileSync('firebase-applet-config.json', JSON.stringify(data, null, 2));
  console.log("Database ID restored.");
} catch (e) {
  console.error("Error updating config:", e);
}
