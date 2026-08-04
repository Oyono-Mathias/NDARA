const fs = require('fs');
let code = fs.readFileSync('src/lib/ambassadorRewardsEngine.ts', 'utf8');
code = code.replace(/'ambassador_levels'/g, "'affiliate_levels'");
code = code.replace(/'ambassador_badges'/g, "'affiliate_badges'");
code = code.replace(/'ambassador_challenges'/g, "'affiliate_challenges'");
code = code.replace(/'reward_history'/g, "'affiliate_rewards'");
code = code.replace(/'leaderboard_cache'/g, "'affiliate_leaderboard'");
fs.writeFileSync('src/lib/ambassadorRewardsEngine.ts', code);
