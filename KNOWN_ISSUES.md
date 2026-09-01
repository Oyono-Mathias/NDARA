# Known Issues & Blockers

## Critical (Blockers)
- **[BLOCKED INFRASTRUCTURE] Missing Firebase Emulator/Live Backend**: E2E tests, transactional operations, wallet migrations, and commission computations cannot be verified in a live runtime without an active `FIRESTORE_EMULATOR_HOST` or a live production Firebase connection. All test scripts default to `BLOCKED` exit code 2 when attempting live data mutations.
- **[SECURITY] Financial PIN Validation**: Frontend prompts for a 4-digit PIN exist, but there is no verifiable backend validation. This must be backed by a secure server-side endpoint or Firebase Function before production release.

## High
- **[QA] Lack of Automated E2E Framework**: Playwright or Cypress are missing. UI workflows (e.g., checkout, course creation) have only been verified statically via Typecheck or visually, not systematically.
- **[DATA] Restore Database Script Destructiveness**: The `scripts/restoreDatabase.ts` lacks granular locking in a live environment. It relies on the emulator for safety.

## Medium
- **[I18N] Incomplete Translations**: The `i18n.ts` architecture is present (FR/EN), but deep components might still have hardcoded strings that need extraction.
- **[ASSETS] CDN Keys**: CDN keys (BunnyCDN) have been patched to use `process.env`, but require actual provisioning in the hosting environment.

## Low
- **[UI] Responsive Edge Cases**: Complex tables (e.g., Transactions, Ambassador Commissions) may overflow on very narrow devices (< 320px) despite `overflow-x-auto`.
