const fs = require('fs');
const file = 'd:/Files/Femboy Banuk/server/templates/emails/index.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync(file, content);
console.log("Fixed!");
