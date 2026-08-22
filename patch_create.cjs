const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseCreate.tsx', 'utf8');

// Add handleDrop
const handleDropCode = `
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };
`;

code = code.replace('const handleFile = (file: File) => {', handleDropCode + '\n    const handleFile = (file: File) => {');

// Add isTitleValid
const isTitleValidCode = `
    const isTitleValid = title.trim().length > 0;
    const isDescValid = description.trim().length > 50;
`;

code = code.replace('const isDescValid = description.trim().length > 50;', isTitleValidCode);

fs.writeFileSync('src/views/instructor/InstructorCourseCreate.tsx', code);
