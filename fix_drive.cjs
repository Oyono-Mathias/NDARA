const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorCourseCreate.tsx');

let code = fs.readFileSync(file, 'utf8');

const regex = /const handleDriveVideoPicked = async \(accessToken: string, fileId: string, fileName: string\) => \{[\s\S]*?const updateStatus = \(list: any\[\]\) => list\.map\(item => item\.name === fileName \? \{ \.\.\.item, status: "Échec" \} : item\);\s+setVideos\(updateStatus\);\s+\}\s+\};\s+/;

const match = code.match(regex);
if (match) {
    code = code.replace(match[0], ''); // Remove from inside handleFileUpload
    code = code.replace(
        "const executeUpload = async",
        match[0] + "\n  const executeUpload = async"
    );
    fs.writeFileSync(file, code);
    console.log("Fixed handleDriveVideoPicked");
} else {
    console.log("Could not find handleDriveVideoPicked");
}
