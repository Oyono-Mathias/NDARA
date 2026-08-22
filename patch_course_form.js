const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/CourseForm.tsx', 'utf8');

// Remove state definitions for totalModules and totalVideos
code = code.replace(/const \[totalModules, setTotalModules\] = useState<number \| "">\(initialData\?.totalModules \|\| ""\);\n/g, '');
code = code.replace(/const \[totalVideos, setTotalVideos\] = useState<number \| "">\(initialData\?.totalVideos \|\| ""\);\n/g, '');

// Remove missing metadata logic
code = code.replace(/const isMissingMetadata = mode === "edit" && \(!initialData\?.totalModules \|\| !initialData\?.totalVideos\);\n/g, '');
code = code.replace(/\{isMissingMetadata && \([\s\S]*?\}\)\n/g, '');

// Adjust onSubmit payload
code = code.replace(/totalModules: Number\(totalModules\) \|\| 0,\n      totalVideos: Number\(totalVideos\) \|\| 0,\n      autoCertificate: Number\(totalModules\) > 0 && Number\(totalVideos\) > 0,\n/g, '');

// Remove the input fields from the UI
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">[\s\S]*?<\/div>\n      <\/div>/, '      </div>');

fs.writeFileSync('src/components/instructor/CourseForm.tsx', code);
console.log("CourseForm patched");
