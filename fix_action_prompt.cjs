const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Remove ActionPromptModal from InfoItem
content = content.replace(`      <ActionPromptModal />
    </div>
  );
}
export function AdminMemberProfileView`, `    </div>
  );
}
export function AdminMemberProfileView`);

// Add it to the end of AdminMemberProfileView
// The end is likely `      </div>\n    </div>\n  );\n}`
content = content.replace(/    <\/div>\n  \);\n}\s*$/, `      <ActionPromptModal />\n    </div>\n  );\n}`);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
