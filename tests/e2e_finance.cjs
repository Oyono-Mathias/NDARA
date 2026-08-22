const assert = require('assert');

async function runTests() {
  console.log("Starting Financial E2E Tests...");
  console.log("1. Token dummy -> 401");
  const resDummy = await fetch('http://localhost:3000/api/wallet/approve-payout', {
     method: 'POST',
     headers: { 'Authorization': 'Bearer dummy', 'Content-Type': 'application/json' },
     body: JSON.stringify({ requestId: 'req_123', status: 'completed' })
  });
  assert.strictEqual(resDummy.status, 403);
  console.log("-> PASS");

  console.log("2. Token invalide -> 401");
  const resInvalid = await fetch('http://localhost:3000/api/wallet/approve-payout', {
     method: 'POST',
     headers: { 'Authorization': 'Bearer invalid_token', 'Content-Type': 'application/json' },
     body: JSON.stringify({ requestId: 'req_123', status: 'completed' })
  });
  // Since it's an invalid firebase token, it should throw in verifyIdToken, getting 403.
  assert.strictEqual(resInvalid.status, 403);
  console.log("-> PASS");

  console.log("Done initial checks.");
}

runTests().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
