const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'GoogleDriveFilePicker.tsx');

let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`interface GoogleDriveFilePickerProps {
  onFileImported: (url: string, fileName: string) => void;
  allowedTypes: 'PDF' | 'IMAGE' | 'VIDEO' | 'ALL';
  folder: string;
  label?: string;
}`,
`interface GoogleDriveFilePickerProps {
  onFileImported?: (url: string, fileName: string) => void;
  onFilePicked?: (accessToken: string, fileId: string, fileName: string, mimeType: string) => void;
  allowedTypes: 'PDF' | 'IMAGE' | 'VIDEO' | 'ALL';
  folder: string;
  label?: string;
  className?: string;
}`
);

code = code.replace(
`export function GoogleDriveFilePicker({ onFileImported, allowedTypes, folder, label = "Importer depuis Google Drive" }: GoogleDriveFilePickerProps) {`,
`export function GoogleDriveFilePicker({ onFileImported, onFilePicked, allowedTypes, folder, label = "Importer depuis Google Drive", className }: GoogleDriveFilePickerProps) {`
);

code = code.replace(
`  const handleDriveFilePicked = async (accessToken: string, fileId: string, fileName: string, mimeType: string) => {
    try {
      setIsLoading(true);`,
`  const handleDriveFilePicked = async (accessToken: string, fileId: string, fileName: string, mimeType: string) => {
    if (onFilePicked) {
      onFilePicked(accessToken, fileId, fileName, mimeType);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);`
);

code = code.replace(
`      onFileImported(data.publicUrl, fileName);`,
`      if (onFileImported) onFileImported(data.publicUrl, fileName);`
);

code = code.replace(
`className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"`,
`className={className || "flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"}`
);

fs.writeFileSync(file, code);
console.log("Patched GoogleDriveFilePicker.tsx");
