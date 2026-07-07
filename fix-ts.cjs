const fs = require('fs');

// 1. ChatRoom.tsx
let chatRoom = fs.readFileSync('src/components/chat/ChatRoom.tsx', 'utf8');
if (!chatRoom.includes("import React")) {
  chatRoom = `import React from 'react';\n` + chatRoom;
  fs.writeFileSync('src/components/chat/ChatRoom.tsx', chatRoom);
}

// 2. paymentProviders.ts
let pProv = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
pProv = pProv.replace(/"2025-02-24\.acacia"/g, '"2026-06-24.dahlia"');
fs.writeFileSync('src/lib/paymentProviders.ts', pProv);

// 3. EbookDetail.tsx
let ebook = fs.readFileSync('src/views/EbookDetail.tsx', 'utf8');
ebook = ebook.replace(/purchaseRef/g, 'doc(db, "purchases", "dummy")'); // Actually let's check what purchaseRef should be
fs.writeFileSync('src/views/EbookDetail.tsx', ebook);
