const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace lines that just have `console.error(..., error);`
  content = content.replace(/.*console\.error\(.*?\);?\r?\n/g, '');
  // Also replace any inline `console.log`
  content = content.replace(/.*console\.log\(.*?\);?\r?\n/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${file}`);
});
