import { adminDb, admin } from '../lib/firebaseAdmin';

export async function generateDailyStats() {
    try {
        console.log("Running job: generateDailyStats");
        const today = new Date().toISOString().split('T')[0];
        
        // Count total users
        const usersSnap = await adminDb.collection('users').count().get();
        const totalUsers = usersSnap.data().count;
        
        // Count total enrollments
        const enrollmentsSnap = await adminDb.collection('enrollments').count().get();
        const totalEnrollments = enrollmentsSnap.data().count;
        
        await adminDb.collection('statistics').doc(today).set({
            date: today,
            totalUsers,
            totalEnrollments,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log("Stats generated for", today);
    } catch (e) {
        console.error("Error in generateDailyStats", e);
    }
}

export async function generateCertificates() {
    try {
        console.log("Running job: generateCertificates");
        const enrollments = await adminDb.collection('enrollments')
            .where('progress', '==', 100)
            .where('certificateGenerated', '==', false)
            .get();
            
        const batch = adminDb.batch();
        let count = 0;
        for (const doc of enrollments.docs) {
            const data = doc.data();
            const certRef = adminDb.collection('certificates').doc();
            batch.set(certRef, {
                studentId: data.studentId,
                courseId: data.courseId,
                issueDate: admin.firestore.FieldValue.serverTimestamp(),
                certificateId: certRef.id
            });
            batch.update(doc.ref, { certificateGenerated: true });
            count++;
            
            if (count >= 400) { // Batch limit is 500
                await batch.commit();
                count = 0;
            }
        }
        if (count > 0) {
            await batch.commit();
        }
        console.log(`Generated certificates for ${enrollments.size} enrollments.`);
    } catch (e) {
        console.error("Error in generateCertificates", e);
    }
}

export async function generateNotifications() {
    try {
        console.log("Running job: generateNotifications");
        // Example: notify users who haven't logged in for 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const inactiveUsers = await adminDb.collection('users')
            .where('lastLogin', '<', sevenDaysAgo)
            .limit(500)
            .get();
            
        const batch = adminDb.batch();
        inactiveUsers.forEach(user => {
            const notifRef = adminDb.collection('notifications').doc();
            batch.set(notifRef, {
                userId: user.id,
                title: 'Nous ne vous avons pas vu depuis un moment !',
                message: 'Continuez votre apprentissage sur NDARA dès aujourd\'hui.',
                type: 'reminder',
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        if (inactiveUsers.size > 0) {
            await batch.commit();
        }
    } catch (e) {
        console.error("Error in generateNotifications", e);
    }
}

export async function cleanupExpiredData() {
    try {
        console.log("Running job: cleanupExpiredData");
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30); // 30 days old logs
        
        const q = adminDb.collection('audit_logs').where('timestamp', '<', cutoff).limit(500);
        const snapshot = await q.get();
        
        const batch = adminDb.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        if (snapshot.size > 0) {
            await batch.commit();
            console.log(`Cleaned up ${snapshot.size} expired logs.`);
        }
    } catch (e) {
        console.error("Error in cleanupExpiredData", e);
    }
}

export async function archiveData() {
    try {
        console.log("Running job: archiveData");
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 2); // 2 years old inactive courses
        
        const courses = await adminDb.collection('courses')
            .where('status', '==', 'draft')
            .where('updatedAt', '<', cutoff)
            .limit(100)
            .get();
            
        const batch = adminDb.batch();
        courses.forEach(course => {
            batch.update(course.ref, { status: 'archived' });
        });
        
        if (courses.size > 0) {
            await batch.commit();
        }
    } catch (e) {
        console.error("Error in archiveData", e);
    }
}

export async function deleteExpiredAccounts() {
    try {
        console.log("Running job: deleteExpiredAccounts");
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 3); // 3 years inactive
        
        const expiredUsers = await adminDb.collection('users')
            .where('lastLogin', '<', cutoff)
            .limit(100)
            .get();
            
        const batch = adminDb.batch();
        expiredUsers.forEach(user => {
            // Soft delete or real delete. We do soft delete for safety
            batch.update(user.ref, { isDeleted: true, status: 'expired' });
        });
        
        if (expiredUsers.size > 0) {
            await batch.commit();
        }
    } catch (e) {
        console.error("Error in deleteExpiredAccounts", e);
    }
}

export async function generateReports() {
    try {
        console.log("Running job: generateReports");
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const revenueSnap = await adminDb.collection('payments')
            .where('status', '==', 'succeeded')
            .get(); // simplistic report
            
        let totalRevenue = 0;
        revenueSnap.forEach(doc => {
            const data = doc.data();
            if (data.amount) totalRevenue += data.amount;
        });
        
        await adminDb.collection('reports').doc(month).set({
            month,
            totalRevenue,
            generatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Error in generateReports", e);
    }
}

export function startCronJobs() {
    console.log("Cron jobs initialized.");
    // Run every 24 hours (86400000 ms)
    setInterval(() => {
        generateDailyStats();
        generateCertificates();
        generateNotifications();
        cleanupExpiredData();
        archiveData();
        deleteExpiredAccounts();
        generateReports();
    }, 86400000);
}
