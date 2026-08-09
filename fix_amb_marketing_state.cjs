const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorMarketing.tsx', 'utf8');

code = code.replace(
    /const \[courses, setCourses\] = useState<any\[\]>\(\[\]\);/,
    "const [courses, setCourses] = useState<any[]>([]);\n  const [ebooks, setEbooks] = useState<any[]>([]);\n  const [certifications, setCertifications] = useState<any[]>([]);"
);

fs.writeFileSync('src/views/ambassador/AmbassadorMarketing.tsx', code);
