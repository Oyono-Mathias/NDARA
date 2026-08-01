const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'CoursePlayer.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/} } from 'lucide-react';/g, "} from 'lucide-react';");
fs.writeFileSync(file, code);
