const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\Khai\\AppData\\Local\\Temp'; // Use temp or scratch
const scratchRoot = 'C:\\Users\\Khai\\.gemini\\antigravity\\scratch';
const inputFile = path.join(scratchRoot, 'files_to_push.json');

if (!fs.existsSync(inputFile)) {
  console.error('files_to_push.json does not exist!');
  process.exit(1);
}

const allFiles = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const totalFiles = allFiles.length;
const numParts = 12;
const batchSize = Math.ceil(totalFiles / numParts);

console.log(`Total files: ${totalFiles}, Num parts: ${numParts}, Batch size: ${batchSize}`);

for (let i = 0; i < numParts; i++) {
  const start = i * batchSize;
  const end = Math.min(start + batchSize, totalFiles);
  const batch = allFiles.slice(start, end);
  if (batch.length === 0) continue;
  
  const outputFile = path.join(scratchRoot, `files_part_${i + 1}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(batch), 'utf8');
  console.log(`Part ${i + 1} saved with ${batch.length} files.`);
}
