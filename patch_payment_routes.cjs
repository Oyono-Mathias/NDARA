const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'paymentRoutes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The original file only passed 3 args to purchaseCourseWithEscrow, but it expects 6.
// Let's get the missing info from the database within the fulfillPayment function.
const oldCode = `    // We must pass ambassadorId if it exists to properly trigger the commission engine
    await purchaseCourseWithEscrow(userId, courseId, ambassadorId);`;

const newCode = `    // Fetch course details for purchaseCourseWithEscrow
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) throw new Error("Course not found");
    const courseData = courseDoc.data()!;
    const sellerId = courseData.instructorId || courseData.authorId || "admin";

    // We must pass ambassadorId if it exists to properly trigger the commission engine
    await purchaseCourseWithEscrow(userId, txData.amount, courseId, courseData.title || "Formation", sellerId, ambassadorId);`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Patched paymentRoutes.ts successfully");
