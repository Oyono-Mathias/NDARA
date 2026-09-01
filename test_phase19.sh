#!/bin/bash
echo "Testing Phase 19 scripts..."

export DRY_RUN=true
echo ">>> DRY_RUN=true"

for f in run_migration.cjs trigger_migrate.cjs patch*.cjs patch.js patch*.js; do
  node $f
  echo "Exit Code: $?"
done

python3 patch_amb_history.py
echo "Exit Code: $?"

npx tsx run_migration_local.ts
echo "Exit Code: $?"

npx tsx scripts/migrateWalletData.ts
echo "Exit Code: $?"

npx tsx scripts/backupDatabase.ts
echo "Exit Code: $?"

# For restore, it requires BACKUP_ID
BACKUP_ID=test_123 npx tsx scripts/restoreDatabase.ts
echo "Exit Code: $?"

npx tsx scripts/generateApiDocs.ts
echo "Exit Code: $?"

echo ">>> LIVE MODE TESTS (Expect BLOCKED)"
export DRY_RUN=false

node run_migration.cjs
echo "Exit Code: $?"

node trigger_migrate.cjs
echo "Exit Code: $?"

