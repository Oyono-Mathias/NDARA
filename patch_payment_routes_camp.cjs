const fs = require('fs');
const file = 'src/routes/paymentRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('campCode: camp || null')) {
    // 1. Add to intent payload extraction
    code = code.replace(
        "let { amount, currency = 'XAF', method, type, courseId, courseTitle, sellerId, phone, couponCode } = req.body;",
        "let { amount, currency = 'XAF', method, type, courseId, courseTitle, sellerId, phone, couponCode, camp, refCode } = req.body;"
    );

    // 2. Add to pending_payments saving
    code = code.replace(
        "couponCode: couponCode || null,",
        "couponCode: couponCode || null,\n            campCode: camp || null,\n            refCode: refCode || null,"
    );

    // 3. Trigger conversion track in fulfillPayment
    // In course_purchase fulfillment
    const trackCode = `
        // Marketing tracking for Ambassador campaigns
        if (txData.refCode) {
            try {
                const { MarketingRoutes } = await import("../lib/marketingBackend.js");
                await MarketingRoutes.trackConversion({
                    body: { ref: txData.refCode, camp: txData.campCode, type: 'sale', amount: txData.amount, courseId: txData.courseId }
                }, { json: () => {} });
            } catch(e) {
                logger.error("Marketing tracking error", e);
            }
        }
        
        await purchaseCourseWithEscrow(`;

    code = code.replace(
        'await purchaseCourseWithEscrow(',
        trackCode
    );

    fs.writeFileSync(file, code);
}
