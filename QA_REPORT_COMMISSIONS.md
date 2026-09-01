# QA Report: Ambassador Commissions

This report evaluates the logic, security, and integrity of the Ambassador Commissions feature.

## 1. Source of Commissions
- **Static Verification**: The UI components (`AmbassadorCommissions`, `AmbassadorDashboard`) correctly request data from the anticipated Firestore collections.
- **Runtime Proof**: BLOCKED. Without a live backend, the data source cannot be verified.

## 2. Calculation & Precision
- **Static Verification**: Python patch (`patch_amb_history.py`) forces the frontend to rely on a `validateWithServer` method rather than computing absolute truth on the client.
- **Runtime Proof**: BLOCKED — backend transactionnel/émulateur non disponible. We cannot verify rounding errors or float precision without a Node/Firebase environment processing test cases.

## 3. Idempotence & Duplicates
- **Static Verification**: Database migration scripts (`patch-transactions.cjs`) enforce a `patched: true` flag to prevent double-processing.
- **Runtime Proof**: BLOCKED. Duplicate payload injection via E2E is impossible currently.

## 4. Timestamps & Attribution
- **Static Verification**: Timestamps rely on `FieldValue.serverTimestamp()`. 
- **Runtime Proof**: BLOCKED.

## 5. Server Authority & Security
- **Assessment**: The frontend code has been audited and patched to remove client-side assignment of commissions.
- **Warning**: The actual security entirely relies on Firebase Security Rules and Firebase Cloud Functions (or a Node.js backend). The frontend *cannot* guarantee financial security. The backend is currently BLOCKED/NOT TESTED.

## Conclusion
The frontend UI for commissions is established, but the financial processing logic remains strictly unverified in a runtime context. **BLOCKED — backend transactionnel/émulateur non disponible.** Never deploy financial logic without live transactional tests.
