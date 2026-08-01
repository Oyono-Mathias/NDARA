const fs = require('fs');
const file = 'src/components/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

const itemsToInsert = `                            <NavItem icon={LayoutGrid} label="DASHBOARD" to="/ambassador/dashboard" current={location.pathname} onClick={onClose} />
                            <NavItem icon={Users} label="MES FILLEULS" to="/ambassador/referrals" current={location.pathname} onClick={onClose} />
                            <NavItem icon={TrendingUp} label="COMMISSIONS" to="/ambassador/commissions" current={location.pathname} onClick={onClose} />
                            <NavItem icon={Wallet} label="PORTEFEUILLE" to="/ambassador/wallet" current={location.pathname} onClick={onClose} />
                            <NavItem icon={Gift} label="RÉCOMPENSES" to="/ambassador/rewards" current={location.pathname} onClick={onClose} />
                            <NavItem icon={Trophy} label="CLASSEMENT" to="/ambassador/leaderboard" current={location.pathname} onClick={onClose} />
                            <NavItem icon={Target} label="CENTRE MARKETING" to="/ambassador/marketing" badge="NEW" current={location.pathname} onClick={onClose} />
`;

if (!code.includes('/ambassador/marketing')) {
    code = code.replace(
        '<NavItem icon={LayoutGrid} label="DASHBOARD" to="/ambassador/dashboard" current={location.pathname} onClick={onClose} />',
        itemsToInsert
    );
    if (!code.includes('import {') || !code.includes('Target')) {
        code = code.replace('Wallet,', 'Wallet, Gift, Trophy, Target, Target, Users, TrendingUp,');
    }
    fs.writeFileSync(file, code);
}
