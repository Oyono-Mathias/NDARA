const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'admin', 'AdminInterface.tsx');
let code = fs.readFileSync(file, 'utf8');

if (code.includes('bientôt')) {
    code = code.replace(
        "Les configurations avancées d'indexation (Balises meta, Open Graph, Twitter Cards) seront bientôt disponibles dans cette section.",
        ""
    );
    fs.writeFileSync(file, code);
    console.log("Bientot removed");
} else {
    console.log("Already removed");
}
