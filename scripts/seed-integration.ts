import { createNceClient } from '../bff/src/nce-client/index.js';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const client = createNceClient({
    nceBaseUrl: process.env.NCE_BASE_URL || 'http://localhost:8000',
    nceApiKey: process.env.NCE_API_KEY || 'test-key',
    nceApiSecret: process.env.NCE_API_SECRET || 'test-secret'
  });

  const fixturePath = path.resolve(process.cwd(), 'app/tests/fixtures/av-fasit/AV_U1A21.easy' + 'schematic.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  // Very naive payload for the script test
  const payload = {
    design: { designLabel: 'AV_U1A21' },
    devices: fixture.devices || [],
    cables: fixture.cables || []
  };

  console.log('Pushing AV_U1A21 to NCE via authorTopology...');
  
  try {
    await client.authorTopology('integration-seed', payload);
    console.log('Successfully authored topology.');
    
    console.log('Fetching back via getTopology...');
    const doc = await client.getTopology('integration-seed');
    console.log('Integration seed successful. Fetched doc with', doc.devices.length, 'devices.');
  } catch (e) {
    console.error('Integration seed failed:', e.message);
    process.exit(1);
  }
}

seed();
