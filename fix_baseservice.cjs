const fs = require('fs');
const file = 'src/services/db/baseService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /toFirestore\(modelObject: any\): DocumentData \{\s+const data = \{ \.\.\.modelObject \};\s+delete data\.id;\s+return data;\s+\}/m,
  `toFirestore(modelObject: any): DocumentData {
      const data = { ...modelObject };
      delete data.id;
      // Remove any undefined properties to prevent Firestore errors
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });
      return data;
    }`
);

fs.writeFileSync(file, code);
