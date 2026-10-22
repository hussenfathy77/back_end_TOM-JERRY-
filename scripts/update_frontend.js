const fs = require('fs');
const path = require('path');

const targetDir = 'D:/docm/term 7/agile/project/nursery-admin/nursery-admin';
const srcDir = path.join(targetDir, 'src');

console.log('Target exists:', fs.existsSync(targetDir));
console.log('Src exists:', fs.existsSync(srcDir));
