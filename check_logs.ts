import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const mod = await adminDb.collection('moderation_logs').get();
  console.log('--- MODERATION LOGS ---');
  mod.docs.forEach(d => console.log(d.id, d.data()));
  
  const sec = await adminDb.collection('security_audit_logs').get();
  console.log('--- SECURITY LOGS ---');
  sec.docs.forEach(d => console.log(d.id, d.data()));
  
  const courses = await adminDb.collection('courses').get();
  console.log('--- COURSES ---');
  console.log('Total:', courses.size);
}
check().catch(console.error).finally(() => process.exit(0));
