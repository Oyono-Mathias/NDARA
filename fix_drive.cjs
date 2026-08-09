const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix strings
code = code.replace(/'--' \+ boundary \+ '\\r\n'/g, "'--' + boundary + '\\r\\n'");
code = code.replace(/'Content-Type: application\/json; charset=UTF-8\\r\n\\r\n'/g, "'Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n'");
code = code.replace(/JSON\.stringify\(metadata\) \+ '\\r\n'/g, "JSON.stringify(metadata) + '\\r\\n'");
code = code.replace(/'Content-Type: ' \+ mimeType \+ '\\r\n\\r\n'/g, "'Content-Type: ' + mimeType + '\\r\\n\\r\\n'");
code = code.replace(/content \+ '\\r\n'/g, "content + '\\r\\n'");

fs.writeFileSync('server.ts', code);
