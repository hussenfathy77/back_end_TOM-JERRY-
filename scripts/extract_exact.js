const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/loq/.gemini/antigravity-ide/brain/585c9b14-e457-450d-835c-109b1952d849/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":203') || line.includes('"step_index":204')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content) {
        fs.writeFileSync('./scripts/step203_raw.txt', obj.content);
        console.log('Saved step203_raw.txt');
      }
    } catch(e) {}
  }
  if (line.includes('"step_index":216') || line.includes('"step_index":217') || line.includes('"step_index":218')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content && obj.content.includes('initialChildren')) {
        fs.writeFileSync('./scripts/children_raw.txt', obj.content);
        console.log('Saved children_raw.txt');
      }
    } catch(e) {}
  }
});
