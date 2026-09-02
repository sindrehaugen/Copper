/* global console, process */
import fs from 'fs';
import path from 'path';

const CL2_PATH = path.resolve('orchestration/CL2.md');
if (!fs.existsSync(CL2_PATH)) {
  console.log('CL2.md not found.');
  process.exit(1);
}

const lines = fs.readFileSync(CL2_PATH, 'utf8').split('\n');
let hasError = false;

const rowRegex = /^(?:>\s*)?\*\s+\[(DONE|LOCKED|IN PROGRESS|WAITING TAG|FAILED TAG|NO TAG|ADOPTED[^\]]*|\?\?|[^\]]+)\]\s+(?:\*\*)?(B\d+|[A-Z]\d+[a-z]?|-)(?:\*\*)?/;
const doneTagRegex = /\[PASSED TAG/;

let currentDoneRow = null;
let currentDoneRowHasTag = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(rowRegex);
  
  if (match) {
    if (currentDoneRow !== null && !currentDoneRowHasTag) {
      console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} lacks [PASSED TAG]`);
      hasError = true;
    }
    
    // Support "* ?? [LOCKED]" which doesn't match perfectly if we only look at the bracket
    let state = match[1];
    if (line.includes('[DONE]')) {
      state = 'DONE';
    } else if (line.includes('[LOCKED]')) {
      state = 'LOCKED';
    } else if (line.includes('[IN PROGRESS]')) {
      state = 'IN PROGRESS';
    }
    
    const id = match[2];
    
    if (id === '-' || id.trim() === '') {
      console.error(`Ledger Error: Row at line ${i + 1} has an empty ID slot: ${line.trim()}`);
      hasError = true;
    }
    
    if (state === 'DONE') {
      currentDoneRow = { lineNum: i + 1, content: line };
      currentDoneRowHasTag = doneTagRegex.test(line);
    } else {
      currentDoneRow = null;
    }
  } else if (currentDoneRow !== null) {
    if (!currentDoneRowHasTag && doneTagRegex.test(line)) {
      currentDoneRowHasTag = true;
    }
    if (/^##+ /.test(line)) {
      if (!currentDoneRowHasTag) {
        console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} lacks [PASSED TAG]`);
        hasError = true;
      }
      currentDoneRow = null;
    }
  }
}

if (currentDoneRow !== null && !currentDoneRowHasTag) {
  console.error(`Ledger Error: [DONE] row at line ${currentDoneRow.lineNum} lacks [PASSED TAG]`);
  hasError = true;
}

if (hasError) {
  process.exit(1);
} else {
  console.log('Ledger integrity check passed.');
  process.exit(0);
}


