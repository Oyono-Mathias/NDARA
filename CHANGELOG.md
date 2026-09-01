# Changelog

## [Phase 20] - Final Documentation & QA Readiness
- **Added**: Final QA Reports, Checklists, Test Reports, and Known Issues.
- **Added**: AI Studio specific `.gitignore`.
- **Status**: Validation Phase (Documentation only).

## [Phase 19] - Migration, Backup & Patching Scripts
- **Added**: `run_migration.cjs`, `run_migration_local.ts` as orchestrators.
- **Added**: Wallet schema migration (`scripts/migrateWalletData.ts`).
- **Added**: Backup and Restore utilities (`backupDatabase.ts`, `restoreDatabase.ts`).
- **Added**: Security and legacy code patches (`patch_auth_middleware.js`, `patch-transactions.cjs`, etc.).
- **Security**: Added explicit blockers to prevent executing live destructive scripts without Firebase Emulator or explicit `ALLOW_PRODUCTION_MIGRATION` flags.
- **Validation Status**: Scripts PASS in `DRY_RUN`, but LIVE operations are BLOCKED (Infrastructure unavailable).

## [Phase 18] - E2E & Core Test Definitions
- **Added**: Shell test orchestrators (`test_phase18.sh`, `test_phase19_real.sh`).
- **Added**: Static and unit-level definitions for Auth, Firestore, Payments, and Roles.
- **Validation Status**: Statically valid (Typecheck PASS, Build PASS). Runtime is largely BLOCKED due to absence of E2E framework and Firebase emulator.

## [Phase 17] - Entry Points & Core Setup
- **Added**: App.tsx, main.tsx, routing configuration.
- **Added**: Guards (`AuthGuard`, `RoleGuard`, `GuestGuard`).
- **Added**: Lazy loading structures for large views.

## [Phase 16] - Advanced Hooks & Services
- **Added**: Advanced UI hooks (offline storage, scroll, mobile detection).
- **Added**: Services layer for Profile, Google Chat, Tracking.

## [Phase 15] - Instructor Components
- **Added**: Quiz builder, resource manager, student dashboard.

## [Phase 14] - Public Views
- **Added**: Landing page, catalogs, public layouts.

---

### Global QA Status Summary
- **Compilation/Build**: PASS
- **Frontend Logic (Static)**: PASS
- **Backend / DB Mutations**: BLOCKED
- **E2E / Browser Automation**: NOT TESTED
- **Financial / Commissions Logic (Runtime)**: BLOCKED
