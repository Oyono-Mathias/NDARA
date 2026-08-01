const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Remove from StatCard
content = content.replace(`      <ActionPromptModal />
    </div>
  );
}`, `    </div>
  );
}`);

// Add Store to lucide imports
content = content.replace("Archive, LogOut, ArrowRight, XCircle", "Archive, LogOut, ArrowRight, XCircle, Store");

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
