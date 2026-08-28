import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { DeviceType } from '../../app/src/model/schema';
import { parseDeviceType } from './parse';

function slugify(text: string | undefined): string {
  if (!text) return 'unknown';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function walkDirectory(dirPath: string): Promise<Map<string, DeviceType>> {
  const result = new Map<string, DeviceType>();

  async function walk(currentPath: string) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml') {
          const content = await readFile(fullPath, 'utf8');
          const { deviceType } = parseDeviceType(content);
          const vendorSlug = slugify(deviceType.manufacturer);
          const modelSlug = slugify(deviceType.model);
          result.set(`${vendorSlug}-${modelSlug}`, deviceType);
        }
      }
    }
  }

  await walk(dirPath);
  return result;
}
