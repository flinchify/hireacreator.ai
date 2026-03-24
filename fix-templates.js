const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'link-in-bio-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all background-related function calls and variables
content = content.replace(/,\s*\.\.\.getBgStyle\(\)/g, '');
content = content.replace(/background:\s*hasStoredColor\s*\?\s*storedBgValue\s*:\s*/g, 'background: ');
content = content.replace(/<BgLayers\s*\/>/g, '');
content = content.replace(/\s*<BgLayers\s*\/>\s*\n/g, '');

// Remove the function definitions
content = content.replace(/\s*const hasBgMedia[^;]*;[\s\S]*?function BgLayers\(\)[^}]*}\s*/g, '');

console.log('Fixed background-related issues');

fs.writeFileSync(filePath, content);
console.log('File updated successfully');