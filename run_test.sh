#!/bin/bash
export NODE_OPTIONS="--experimental-strip-types --no-warnings"

PASS_COUNT=0
FAIL_COUNT=0
BLOCKED_COUNT=0

run_test() {
    echo "----------------------------------------"
    echo "Running $1"
    node "$1"
    CODE=$?
    if [ $CODE -eq 0 ]; then
        echo "[$1] => PASS"
        PASS_COUNT=$((PASS_COUNT+1))
    elif [ $CODE -eq 2 ]; then
        echo "[$1] => BLOCKED"
        BLOCKED_COUNT=$((BLOCKED_COUNT+1))
    else
        echo "[$1] => FAIL"
        FAIL_COUNT=$((FAIL_COUNT+1))
    fi
    echo "----------------------------------------"
}

run_test "test-db.js"
run_test "test_firestore.cjs"
run_test "test_auth.cjs"
run_test "check_auth.ts"
run_test "security_test.ts"
run_test "test_paymentRoutes.ts"
run_test "test_payments.ts"
run_test "run_e2e_test.ts"
run_test "tests/e2e_finance.cjs"
run_test "audit_courses.ts"
run_test "audit_manual_test.ts"
run_test "audit_transaction.ts"

echo "====================================="
echo "SUMMARY: PASS=$PASS_COUNT | FAIL=$FAIL_COUNT | BLOCKED=$BLOCKED_COUNT"
echo "====================================="
if [ $FAIL_COUNT -gt 0 ]; then
    exit 1
fi
exit 0
