/* global console, process */
import fs from 'fs';
import path from 'path';

let hasError = false;

// 1. Gather all rows across all ledgers
const ledgers = ['orchestration/CL.md', 'orchestration/CL2.md', 'orchestration/CL3.md'];
const ids = new Set();
let totalRows = 0;

for (const ledger of ledgers) {
  const filepath = path.resolve(ledger);
  if (!fs.existsSync(filepath)) continue;
  
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  const bulletCount = lines.filter(l => /^\s*\*\s+\[/.test(l)).length;
  
  // Use the robust regex from the instructions
  const rowRegex = /^\s*\*\s+(?:\S+\s+)?\[([^\]]+)\]\s+\*{0,2}(B\d+)\*{0,2}\s*[—-]/;
  let rowsFound = 0;
  
  let currentDoneRow = null;
  let currentDoneRowHasTag = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(rowRegex);
    
    if (match) {
      rowsFound++;
      totalRows++;
      
      const state = match[1];
      const id = match[2];
      
      if (ids.has(id)) {
        console.error(`Ledger Error: Duplicate B-number ${id} in ${ledger}:${i+1}`);
        hasError = true;
      }
      ids.add(id);
      
      if (id === '-' || id.trim() === '') {
        console.error(`Ledger Error: Row at line ${i + 1} has an empty ID slot: ${line.trim()}`);
        hasError = true;
      }
      
      if (currentDoneRow !== null && !currentDoneRowHasTag) {
        console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} in ${ledger} lacks [PASSED TAG]`);
        hasError = true;
      }
      
      if (line.includes('[DONE]')) {
        currentDoneRow = { lineNum: i + 1, content: line };
        currentDoneRowHasTag = line.includes('[PASSED TAG');
      } else {
        currentDoneRow = null;
      }
    } else if (currentDoneRow !== null) {
      if (line.includes('[PASSED TAG')) {
        currentDoneRowHasTag = true;
      }
      if (/^##+ /.test(line)) {
        if (!currentDoneRowHasTag) {
          console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} in ${ledger} lacks [PASSED TAG]`);
          hasError = true;
        }
        currentDoneRow = null;
      }
    }
  }
  
  if (currentDoneRow !== null && !currentDoneRowHasTag) {
    console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} in ${ledger} lacks [PASSED TAG]`);
    hasError = true;
  }
  
  if (rowsFound < bulletCount) {
    console.error(`Ledger Error in ${ledger}: matcher found ${rowsFound} rows, but there are ${bulletCount} bullets. PATTERN is broken.`);
    hasError = true;
  }
  if (ledger.includes('CL2') && rowsFound < 50) {
    console.error(`Ledger Error in ${ledger}: matcher found ${rowsFound} rows, expected at least 50.`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`Ledger integrity check passed across ${totalRows} rows.`);
  process.exit(0);
}
