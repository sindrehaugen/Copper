import { validateAudioLines } from './app/src/validation/audio-line.ts';
import fs from 'fs';

const code = fs.readFileSync('./app/src/validation/b125-accept.test.ts', 'utf-8');
// Parse doc out of the test file... actually let's just run ts-node on a script
