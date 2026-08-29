/* global process, console */
import { evaluateQuality } from '../app/src/router/quality.ts';

export const FLOOR_SCORE = 1000;

export function evaluateFixtures(fixtures) {
    let totalScore = 0;
    for (const sheet of fixtures) {
        totalScore += evaluateQuality(sheet.paths, sheet.nodeBounds);
    }
    return totalScore;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/rig-ratchet.mjs');
if (isMain) {
    const fixtures = Array.from({ length: 15 }, (_, i) => ({
        id: `fixture-${i}`,
        paths: [[{ x: 0, y: 0 }, { x: 10, y: 10 }]],
        nodeBounds: []
    }));

    const totalScore = evaluateFixtures(fixtures);
    console.log(`Quality score: ${totalScore} (Floor: ${FLOOR_SCORE})`);

    if (totalScore > FLOOR_SCORE) {
        console.error('Score is worse than the acceptable floor. Failing.');
        process.exit(1);
    } else {
        console.log('Score is within limits.');
    }
}


