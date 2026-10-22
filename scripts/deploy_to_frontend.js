const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'templates');
const targetSrc = 'D:/docm/term 7/agile/project/nursery-admin/nursery-admin/src';

const files = [
  'api.js',
  'Login.jsx',
  'UserManagement.jsx',
  'ChildrenManagement.jsx',
  'Dashboard.jsx',
  'UserManagement.css',
  'ChildrenManagement.css'
];

for (const file of files) {
  const src = path.join(templatesDir, file);
  const dest = path.join(targetSrc, file);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> ${dest}`);
}

console.log('All files successfully deployed to nursery-admin/src!');
