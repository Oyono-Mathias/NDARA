import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function auditDB() {
  const collections = ['courses', 'chapters', 'lessons', 'moderation_logs', 'security_audit_logs', 'notifications'];
  const results: any = {};

  for (const coll of collections) {
    const snap = await adminDb.collection(coll).get();
    results[coll] = { total: snap.size, docs: [] };
    
    // Aggregations for courses
    if (coll === 'courses') {
      const statuses: any = { draft: 0, pending_review: 0, published: 0, rejected: 0, archived: 0, undefined: 0 };
      snap.docs.forEach(d => {
        const status = d.data().status || 'undefined';
        if (statuses[status] !== undefined) statuses[status]++;
        else statuses[status] = 1;
        
        // We only want to log details of courses created during our E2E test to prove it worked
        if (d.id.startsWith('e2e_') || d.id === 'test_course_id') {
           results[coll].docs.push({ id: d.id, data: d.data() });
        }
      });
      results[coll].statuses = statuses;
    } else {
      // For logs, chapters, lessons, we want to see the E2E records
      snap.docs.forEach(d => {
         const data = d.data();
         if (
           data.courseId?.startsWith('e2e_') || 
           d.id.startsWith('e2e_') || 
           data.action === 'Approuver' || 
           data.action === 'Rejeter' ||
           data.title?.includes('E2E') ||
           data.message?.includes('E2E')
         ) {
           results[coll].docs.push({ id: d.id, data: d.data() });
         }
      });
    }
  }

  // Check if any security logs contain course-related actions
  const secSnap = await adminDb.collection('security_audit_logs').get();
  const courseActionsInSec = secSnap.docs.filter(d => {
    const act = d.data().action || '';
    return act.includes('COURSE') || act.includes('PUBLISH') || act.includes('REVIEW');
  }).map(d => ({id: d.id, action: d.data().action}));
  
  results.security_audit_logs.courseActions = courseActionsInSec;

  console.log(JSON.stringify(results, null, 2));
}

auditDB().catch(console.error).finally(() => process.exit(0));
