import { createNceClient } from '../bff/src/nce-client/index.js';
import { Site, Location, DesignDocument } from '../app/src/model/schema.js';

export interface D365FL {
  id: string;
  name: string;
  parentId?: string | null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+]/g, '-').replace(/(^-|-$)/g, '');
}

export function transformD365(fls: D365FL[]): { sites: Site[], locations: Location[] } {
  const sites: Site[] = [];
  const locations: Location[] = [];
  
  const flMap = new Map<string, D365FL>();
  for (const fl of fls) {
    flMap.set(fl.id, fl);
  }
  
  function findRootId(id: string): string {
    let current = flMap.get(id);
    while (current && current.parentId) {
      current = flMap.get(current.parentId);
    }
    if (!current) throw new Error(`Root not found for ${id}`);
    return current.id;
  }

  for (const fl of fls) {
    const slug = slugify(fl.name) || fl.id.toLowerCase();
    if (!fl.parentId) {
      sites.push({
        id: fl.id,
        name: fl.name,
        slug: slug,
      });
    } else {
      locations.push({
        id: fl.id,
        name: fl.name,
        slug: slug,
        siteId: findRootId(fl.id),
        parentId: fl.parentId,
      });
    }
  }
  return { sites, locations };
}

export async function importD365ToNce(namespace: string, fls: D365FL[], apiKey: string, baseUrl: string) {
  const { sites, locations } = transformD365(fls);
  const doc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'D365 Import',
    sites,
    locations,
    racks: [],
    deviceTypes: [],
    devices: [],
    cables: [],
    signalClasses: []
  };
  const client = createNceClient({ nceApiKey: apiKey, nceBaseUrl: baseUrl, port: 3001, devMode: true, devIdentity: { upn: "dev", allowedNamespaces: ["default"], isDev: true } });
  await client.authorTopology(namespace, doc);
}
