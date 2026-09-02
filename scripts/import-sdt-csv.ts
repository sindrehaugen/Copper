import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CSV_DIR = path.join(ROOT, '..', 'Speaker Design Tool v2.0', 'public', 'csv');
const OUT_DIR = path.join(ROOT, 'catalog', 'audio');

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function writeYaml(manufacturer: string, model: string, extraData: any, type: string) {
  const mfrSlug = slugify(manufacturer);
  const modelSlug = slugify(model);
  const outPath = path.join(OUT_DIR, mfrSlug);
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath, { recursive: true });
  }
  const slug = mfrSlug + '-' + modelSlug;
  let yaml = '---\nmanufacturer: "' + manufacturer + '"\nmodel: "' + model + '"\nslug: "' + slug + '"\nu_height: 1\nis_full_depth: false\n';
  yaml += 'copper_extensions:\n  acoustics:\n    device_class: "' + type + '"\n';
  for (const [k, v] of Object.entries(extraData)) {
    if (v !== '' && v !== undefined) {
      if (Array.isArray(v)) {
        yaml += '    ' + k + ': [' + v.join(', ') + ']\n';
      } else if (!isNaN(Number(v))) {
        yaml += '    ' + k + ': ' + v + '\n';
      } else {
        yaml += '    ' + k + ': "' + v + '"\n';
      }
    }
  }
  fs.writeFileSync(path.join(outPath, modelSlug + '.yaml'), yaml);
}

function run() {
  let countSpk = 0; let countAmp = 0; let countCab = 0;
  
  const spkTxt = fs.readFileSync(path.join(CSV_DIR, 'speakers_db_v2.csv'), 'utf8');
  const spkLines = spkTxt.split('\n').map(l => l.trim()).filter(l => l);
  for (let i = 1; i < spkLines.length; i++) {
    const row = spkLines[i].split(',').map(c => c.trim());
    if (row.length < 2) continue;
    const model = row[0]; const brand = row[1];
    const impedance = row[2]; const z_min = row[3];
    const wattage_rms = row[4]; const wattage_peak = row[5];
    const max_spl = row[6];
    const category = row.pop();
    const type = row.pop();
    const taps = row.slice(7).filter(t => t);
    writeYaml(brand, model, { impedance, z_min, wattage_rms, wattage_peak, max_spl, taps, type, category }, 'speaker');
    countSpk++;
  }

  const ampTxt = fs.readFileSync(path.join(CSV_DIR, 'amplifiers_db_v2.csv'), 'utf8');
  const ampLines = ampTxt.split('\n').map(l => l.trim()).filter(l => l);
  for (let i = 1; i < ampLines.length; i++) {
    const row = ampLines[i].split(',').map(c => c.trim());
    if (row.length < 2) continue;
    const model = row[0]; const brand = row[1];
    const df = row[2]; const df_rated_at = row[3];
    const min_load = row[4]; const watt_8 = row[5];
    const watt_4 = row[6]; const watt_2 = row[7];
    const watt_100v = row[8]; const min_load_bridge = row[9];
    const watt_bridge_8 = row[10]; const watt_bridge_4 = row[11];
    const max_voltage_peak = row[12];
    writeYaml(brand, model, { df, df_rated_at, min_load, watt_8, watt_4, watt_2, watt_100v, min_load_bridge, watt_bridge_8, watt_bridge_4, max_voltage_peak }, 'amplifier');
    countAmp++;
  }

  const cabTxt = fs.readFileSync(path.join(CSV_DIR, 'cables_db_v2.csv'), 'utf8');
  const cabLines = cabTxt.split('\n').map(l => l.trim()).filter(l => l);
  for (let i = 1; i < cabLines.length; i++) {
    const row = cabLines[i].split(',').map(c => c.trim());
    if (row.length < 2) continue;
    const name = row[0]; const brand = row[1]; const model = row[2] || name;
    const resistance = row[3]; const capacitance = row[4]; const inductance = row[5];
    writeYaml(brand, model, { resistance, capacitance, inductance }, 'cable');
    countCab++;
  }
  
  console.log('Parsed ' + countSpk + ' speakers, ' + countAmp + ' amps, ' + countCab + ' cables.');
}

run();

