const fs = require('fs');
let code = fs.readFileSync('src/components/public/Hero.tsx', 'utf8');

code = code.replace(
  '<Button variant="primary" className="w-full sm:w-auto py-4 px-8 text-lg" asChild>',
  '<Link to="/login" className="w-full sm:w-auto">'
);
code = code.replace(
  '<Link to="/login">',
  '<Button variant="primary" className="w-full py-4 px-8 text-lg">'
);
code = code.replace(
  'Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />\n            </Link>\n          </Button>',
  'Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />\n          </Button>\n            </Link>'
);

fs.writeFileSync('src/components/public/Hero.tsx', code);
