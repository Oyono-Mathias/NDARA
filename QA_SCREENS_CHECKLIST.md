# QA Screens Validation Checklist

*Note: This checklist represents the static analysis and manual verification status. Many runtime interactions (like successful API submissions) remain NOT TESTED due to the absence of a live backend/E2E runner.*

## 1. Public Space (Landing & Auth)
- [x] **Landing Page**: Loading state verified statically.
- [ ] **Landing Page**: Responsive mobile / Android First (NOT VERIFIED IN BROWSER).
- [ ] **Landing Page**: i18n FR/EN complete.
- [x] **Login View**: Empty state verified.
- [ ] **Login View**: Error state (Wrong credentials) - NOT TESTED.
- [ ] **Login View**: Success state & redirection - NOT TESTED.
- [x] **Register View**: Empty state verified.
- [ ] **Register View**: Validation errors & Success state - NOT TESTED.

## 2. User Space
- [x] **Account Settings**: Static UI present.
- [x] **AuthGuard**: Protected route barrier exists.
- [ ] **2FA Setup**: QR Code rendering and verification - BLOCKED.
- [ ] **User Notifications**: Real-time Socket updates - BLOCKED.

## 3. Instructor Space
- [x] **Dashboard**: UI layout confirmed.
- [x] **RoleGuard**: Restricted to 'instructor' role.
- [x] **Course Creator**: Form validation initialized statically.
- [ ] **Course Creator**: Media Uploads (BunnyCDN) - BLOCKED.
- [ ] **Course Edit**: Draft saving & Validation - BLOCKED.
- [ ] **Instructor Quiz**: Flow & grading logic - NOT TESTED.
- [ ] **Live Sessions**: Chat / Streaming embeds - NOT TESTED.

## 4. Ambassador Space
- [x] **Dashboard**: Static UI layout present.
- [x] **RoleGuard**: Restricted to 'ambassador' role.
- [ ] **Referral Links**: Link generation and tracking - BLOCKED.
- [ ] **Commissions History**: Rendering of past payouts - BLOCKED.

## 5. Admin Space
- [x] **Market Control**: UI layout verified.
- [x] **RoleGuard**: Restricted to 'admin' role.
- [ ] **Members Manager**: Fetching users list - BLOCKED.
- [ ] **Moderation**: Banning/Unbanning flow - BLOCKED.
- [ ] **Withdrawals**: Approving ambassador payments - BLOCKED.

## 6. Wallet, Payments & Transactions
- [x] **Wallet UI**: Empty states and history layout present.
- [ ] **Wallet UI**: Real-time balance updates - BLOCKED.
- [x] **PIN 4-Digit Prompt**: UI component exists for financial actions.
- [ ] **PIN Validation**: Server-side cryptography check - BLOCKED.
- [ ] **Checkout Flow**: Stripe / Mobile Money integration - BLOCKED.

---
**Status Legend**:
- `[x]` = Confirmed statically (component exists, layout is theoretically sound).
- `[ ]` = BLOCKED / NOT TESTED (requires runtime data, emulator, or browser automation).
