const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/loq/.gemini/antigravity-ide/brain/585c9b14-e457-450d-835c-109b1952d849/.system_generated/logs/transcript_full.jsonl')
});

let foundUser = false;
let foundChild = false;

rl.on('line', (line) => {
  if (line.includes('Reading full UserManagement.jsx') && !foundUser) {
    foundUser = true;
  } else if (foundUser && !line.includes('Reading full UserManagement.jsx')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content && obj.content.includes('initialUsers')) {
        // extract the file content from output
        const match = obj.content.match(/Output:\r?\n([\s\S]*)$/);
        if (match) {
          fs.writeFileSync('./scripts/original_UserManagement.jsx', match[1]);
          console.log('Saved original_UserManagement.jsx');
          foundUser = false;
        }
      }
    } catch (e) {}
  }

  if (line.includes('Reading full ChildrenManagement.jsx') && !foundChild) {
    foundChild = true;
  } else if (foundChild && !line.includes('Reading full ChildrenManagement.jsx')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content && obj.content.includes('initialChildren')) {
        const match = obj.content.match(/Output:\r?\n([\s\S]*)$/);
        if (match) {
          fs.writeFileSync('./scripts/original_ChildrenManagement.jsx', match[1]);
          console.log('Saved original_ChildrenManagement.jsx');
          foundChild = false;
        }
      }
    } catch (e) {}
  }
});
