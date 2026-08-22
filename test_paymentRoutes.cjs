const fs = require('fs');
const file = 'src/routes/paymentRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

if (code.includes('mock') || code.includes('simulated')) {
    console.log("WARNING: Mock or simulated code found in paymentRoutes");
} else {
    console.log("No mocks found in paymentRoutes");
}
