const fs = require('fs');
const file = 'src/views/Checkout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('camp: localStorage.getItem(')) {
    code = code.replace(
        "couponCode: appliedCoupon ? appliedCoupon.code : undefined",
        "couponCode: appliedCoupon ? appliedCoupon.code : undefined,\n                    camp: localStorage.getItem('ndara_camp') || undefined,\n                    refCode: localStorage.getItem('ndara_ref') || undefined"
    );
    fs.writeFileSync(file, code);
}
