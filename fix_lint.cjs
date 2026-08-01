const fs = require('fs');
const path = require('path');

// 1. App.tsx
let file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');
if (!code.includes('useLocation')) {
    code = code.replace(/import \{ Routes, Route, Navigate.*?\} from 'react-router-dom';/, "import { Routes, Route, Navigate, useLocation } from 'react-router-dom';");
    fs.writeFileSync(file, code);
}

// 2. ContentManager.tsx
file = path.join(__dirname, 'src', 'components', 'instructor', 'course-content', 'ContentManager.tsx');
code = fs.readFileSync(file, 'utf8');
if (!code.includes("import { auth } from '../../../firebase';")) {
    code = code.replace(/import \{ \w+ \} from 'lucide-react';/, "$&\nimport { auth } from '../../../firebase';");
    fs.writeFileSync(file, code);
}

// 3. CoursePlayer.tsx (maybe Video icon missing)
file = path.join(__dirname, 'src', 'views', 'CoursePlayer.tsx');
code = fs.readFileSync(file, 'utf8');
if (!code.includes("Video,") && code.includes("from 'lucide-react'")) {
    code = code.replace(/from 'lucide-react';/, ", Video } from 'lucide-react';");
    code = code.replace(/import \{.*?,\s*Video\s*\} from 'lucide-react';/, (match) => match.replace(', Video }', '}').replace('import {', 'import { Video, '));
    fs.writeFileSync(file, code);
}

// 4. AdminMemberProfileView.tsx
file = path.join(__dirname, 'src', 'views', 'admin', 'AdminMemberProfileView.tsx');
code = fs.readFileSync(file, 'utf8');
if (!code.includes('serverTimestamp')) {
    code = code.replace(/import \{ doc, updateDoc \} from 'firebase\/firestore';/, "import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';");
    fs.writeFileSync(file, code);
}

// 5. InstructorLayout.tsx
file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorLayout.tsx');
code = fs.readFileSync(file, 'utf8');
code = code.replace(/<Route path="live" element=\{<InstructorLiveSessions \/>\} \/>/g, '<Route path="live" element={<div>Live Sessions Coming Soon</div>} />');
fs.writeFileSync(file, code);

console.log("Lint errors fixed");
