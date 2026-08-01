const fs = require('fs');

// Remove from main.tsx
let main = fs.readFileSync('src/main.tsx', 'utf8');
main = main.replace('<ConfirmProvider>\n', '');
main = main.replace('</ConfirmProvider>\n    ', '');
fs.writeFileSync('src/main.tsx', main);

// Add to App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
// wrap the <BrowserRouter> with <ConfirmProvider>
app = app.replace('<BrowserRouter>', '<ConfirmProvider>\n        <BrowserRouter>');
app = app.replace('</BrowserRouter>', '</BrowserRouter>\n      </ConfirmProvider>');
fs.writeFileSync('src/App.tsx', app);
