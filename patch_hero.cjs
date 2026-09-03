const fs = require('fs');
let code = fs.readFileSync('src/components/public/Hero.tsx', 'utf8');

code = code.replace(
  "import { Button } from '../ui/button';",
  "import { Button } from '../ui/button';\nimport { Link } from 'react-router-dom';"
);

code = code.replace(
  '<Button variant="primary" className="w-full sm:w-auto py-4 px-8 text-lg">',
  '<Button variant="primary" className="w-full sm:w-auto py-4 px-8 text-lg" asChild>\n            <Link to="/login">'
);

code = code.replace(
  'Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />\n          </Button>',
  'Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />\n            </Link>\n          </Button>'
);

fs.writeFileSync('src/components/public/Hero.tsx', code);
