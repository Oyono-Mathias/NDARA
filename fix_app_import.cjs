const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useLocation,')) {
    code = code.replace(
        '} from "react-router-dom";',
        '  useLocation,\n} from "react-router-dom";'
    );
    fs.writeFileSync(file, code);
}
