import { readFileSync } from 'fs';
import { resolve } from 'path';
import { readProjectSchema } from '../app/src/exchange/projectschema/read.js';
import { createNceClient } from '../bff/src/nce-client/index.js';

function loadConfig() {
    return {
        nceBaseUrl: process.env.NCE_BASE_URL || 'http://localhost:3000',
        nceApiKey: process.env.NCE_API_KEY || 'test-key',
    };
}

export async function runImport(args: string[]) {
    if (args.length < 2) {
        throw new Error('Usage: tsx import.ts <file_path> <namespace>');
    }
    
    const filePath = resolve(process.cwd(), args[0]);
    const namespace = args[1];
    
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    const { document, report } = readProjectSchema(content);
    
    const client = createNceClient(loadConfig());
    
    const payload = {
        designLabel: document.designLabel,
        status: 'planned',
        sites: document.sites,
        locations: document.locations,
        racks: document.racks,
        deviceTypes: document.deviceTypes,
        devices: document.devices,
        cables: document.cables,
        signalClasses: document.signalClasses,
    };
    
    await client.authorTopology(namespace, payload);
    
    console.log(`Imported ${report.locationCount} locations, ${report.rackCount} racks, ${report.deviceCount} devices`);
}

// Ensure the script runs when called directly
const isMain = typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('import.ts');
if (isMain) {
    runImport(process.argv.slice(2)).catch(console.error);
}
