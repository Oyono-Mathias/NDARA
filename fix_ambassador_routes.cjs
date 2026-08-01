const fs = require('fs');
const file = 'src/views/ambassador/AmbassadorLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

const importsToAdd = `
import { AmbassadorReferrals } from './AmbassadorReferrals';
import { AmbassadorCommissions } from './AmbassadorCommissions';
import { AmbassadorWallet } from './AmbassadorWallet';
import { AmbassadorRewards } from './AmbassadorRewards';
import { AmbassadorLeaderboard } from './AmbassadorLeaderboard';
import { AmbassadorMarketing } from './AmbassadorMarketing';
`;

const routesToAdd = `
              <Route path="referrals" element={<AmbassadorReferrals />} />
              <Route path="commissions" element={<AmbassadorCommissions />} />
              <Route path="wallet" element={<AmbassadorWallet />} />
              <Route path="rewards" element={<AmbassadorRewards />} />
              <Route path="leaderboard" element={<AmbassadorLeaderboard />} />
              <Route path="marketing" element={<AmbassadorMarketing />} />
`;

if (!code.includes('AmbassadorReferrals')) {
    code = code.replace(
        "import { AmbassadorDashboard } from './AmbassadorDashboard';",
        "import { AmbassadorDashboard } from './AmbassadorDashboard';" + importsToAdd
    );
    code = code.replace(
        '<Route path="dashboard" element={<AmbassadorDashboard />} />',
        '<Route path="dashboard" element={<AmbassadorDashboard />} />\n' + routesToAdd
    );
    fs.writeFileSync(file, code);
}
