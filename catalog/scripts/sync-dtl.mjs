/* global console, process */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const CATALOG_DIR = path.join(ROOT, 'catalog');
const DTL_DIR = path.join(CATALOG_DIR, 'devicetype-library');

const PINNED_SHA = '3387459d1c4f83ddbbbce9aede65470929c74963';
const REPO_URL = 'https://github.com/netbox-community/devicetype-library.git';

const VENDORS = ['cisco', 'netgear', 'ubiquiti', 'apc', 'eaton', 'Middle Atlantic', 'yamaha', 'Blackmagicdesign'];

async function main() {
    console.log('Syncing devicetype-library...');
    const tmpDir = path.join(ROOT, '.tmp-dtl-clone');

    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    fs.mkdirSync(tmpDir, { recursive: true });
    execSync('git init', { cwd: tmpDir, stdio: 'inherit' });
    execSync('git remote add origin ' + REPO_URL, { cwd: tmpDir, stdio: 'inherit' });
    execSync('git config core.sparseCheckout true', { cwd: tmpDir, stdio: 'inherit' });
    
    // Add sparse checkout paths, but put quotes because of space in 'Middle Atlantic'
    const sparsePaths = VENDORS.map(v => 'device-types/' + v + '/').join('\n');
    fs.writeFileSync(path.join(tmpDir, '.git', 'info', 'sparse-checkout'), sparsePaths);

    execSync('git fetch --depth 1 origin ' + PINNED_SHA, { cwd: tmpDir, stdio: 'inherit' });
    execSync('git checkout ' + PINNED_SHA, { cwd: tmpDir, stdio: 'inherit' });

    if (fs.existsSync(DTL_DIR)) {
        fs.rmSync(DTL_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DTL_DIR, { recursive: true });

    for (const vendor of VENDORS) {
        const srcDir = path.join(tmpDir, 'device-types', vendor);
        const targetVendor = vendor.toLowerCase().replace(' ', '-').replace('blackmagicdesign', 'blackmagic-design');
        const destDir = path.join(DTL_DIR, targetVendor);
        
        if (fs.existsSync(srcDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
            for (const file of files) {
                fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            }
            console.log('Synced ' + files.length + ' files for vendor: ' + targetVendor);
        } else {
            console.warn('Vendor directory not found in upstream: ' + vendor);
        }
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('Sync complete.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});