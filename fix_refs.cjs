const fs = require('fs');

let file = 'src/views/instructor/InstructorCourseCreate.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const imagesInputRef')) {
  // Add refs
  content = content.replace('const [loading, setLoading] = useState(false);', `const [loading, setLoading] = useState(false);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const videosInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);`);
  
  // Replace getElementById calls
  content = content.replace(/document\.getElementById\("imagesInput"\)\?\.click\(\)/g, "imagesInputRef.current?.click()");
  content = content.replace(/document\.getElementById\("videosInput"\)\?\.click\(\)/g, "videosInputRef.current?.click()");
  content = content.replace(/document\.getElementById\("docsInput"\)\?\.click\(\)/g, "docsInputRef.current?.click()");
  
  // Replace inputs
  content = content.replace(/id="imagesInput"/g, 'id="imagesInput" ref={imagesInputRef}');
  content = content.replace(/id="videosInput"/g, 'id="videosInput" ref={videosInputRef}');
  content = content.replace(/id="docsInput"/g, 'id="docsInput" ref={docsInputRef}');
  
  // Check if useRef is imported
  if (!content.includes('useRef')) {
    content = content.replace('import { useState', 'import { useState, useRef');
  }
}

fs.writeFileSync(file, content, 'utf8');
