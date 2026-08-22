import dotenv from 'dotenv';
dotenv.config();
import crypto from "crypto";

async function run() {
  const appKey = process.env.MESOMB_APPLICATION_KEY;
  const nonce = crypto.randomUUID();
  const date = new Date().toISOString();
  
  const response = await fetch('https://mesomb.hachther.com/api/v1.1/payment/collect/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MeSomb-Application': appKey!,
      'X-MeSomb-Nonce': nonce,
      'X-MeSomb-Date': date
    },
    body: JSON.stringify({
      amount: 1000,
      payer: '670000000',
      fees: false,
      service: 'MTN',
      currency: 'XAF',
      message: 'Test API',
      redirect: 'http://localhost:3000/callback',
      reference: 'TEST_TX_' + Date.now(),
      extract: true
    })
  });
  
  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Response:", data);
}
run().catch(console.error);
