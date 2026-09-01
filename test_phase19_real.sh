#!/bin/bash
echo "=== Phase 19 Real Tests ==="
export DRY_RUN=true

# The migration orchestrators
echo "--- run_migration.cjs ---"
node run_migration.cjs
echo "Exit Code: $?"

echo "--- run_migration_local.ts ---"
npx tsx run_migration_local.ts
echo "Exit Code: $?"

# Individual scripts in DRY RUN
echo "--- patch-transactions.cjs ---"
node patch-transactions.cjs
echo "Exit Code: $?"

echo "--- scripts/backupDatabase.ts ---"
npx tsx scripts/backupDatabase.ts
echo "Exit Code: $?"

echo "--- patch_auth_middleware.js ---"
node patch_auth_middleware.js
echo "Exit Code: $?"

echo "--- patch_admin_courses.cjs ---"
node patch_admin_courses.cjs
echo "Exit Code: $?"

echo "--- patch_amb_history.py ---"
python3 patch_amb_history.py
echo "Exit Code: $?"

# Build processes
echo "--- typecheck and build ---"
npm run typecheck
npm run build
echo "Build Exit Code: $?"

