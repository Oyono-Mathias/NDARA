const fs = require('fs');

const filesToFix = [
  "src/views/admin/AdminSupport.tsx",
  "src/views/admin/AdminTransactions.tsx",
  "src/views/admin/AdminInstructors.tsx",
  "src/views/admin/AdminModeration.tsx",
  "src/views/admin/AdminSquads.tsx",
  "src/views/admin/AdminMembers.tsx",
  "src/views/admin/AdminMarketControl.tsx",
  "src/views/instructor/InstructorCourses.tsx",
  "src/views/OfflineDownloads.tsx",
  "src/views/Account.tsx",
  "src/components/instructor/announcements/AnnouncementsClient.tsx",
  "src/components/instructor/quiz/QuizPageClient.tsx",
  "src/components/instructor/quiz/editor/QuestionBankModal.tsx",
  "src/components/instructor/resources/ResourcesClient.tsx"
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('confirm(') || content.includes('window.confirm(')) {
    // Add import
    let depth = file.split('/').length - 2;
    let relativePrefix = depth <= 0 ? './' : '../'.repeat(depth);
    if (!content.includes('useConfirm')) {
      content = `import { useConfirm } from '${relativePrefix}components/ui/ConfirmDialog';\n` + content;
    }
    
    // We also need to inject const confirm = useConfirm(); in the component
    // This is hard to do safely with Regex.
    // Since we only have 14 files, let's just do it.
    
    // find component name by looking for export function X
    content = content.replace(/(export (?:default )?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*(?::\s*[^\{]+)?\s*\{)/g, (match) => {
       if (match.includes('useConfirm()')) return match;
       return match + '\n  const confirm = useConfirm();\n';
    });
    
    // find confirm(...) and replace with await confirm(...)
    content = content.replace(/(!?)window\.confirm\(([^)]+)\)/g, "$1(await confirm($2))");
    content = content.replace(/(!?)confirm\(([^)]+)\)/g, "$1(await confirm($2))");
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
