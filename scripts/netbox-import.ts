/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DesignDocument,
  DesignDocumentSchema,
  Site,
  Location,
  Rack,
  DeviceType,
  Device,
  Cable,
  CableTermination,
} from '../app/src/model/schema.js';

export async function importFromNetBox(netboxUrl: string, token: string): Promise<DesignDocument> {
  const headers = {
    Authorization: "Token " + token,
    Accept: 'application/json',
  };

  const fetchAll = async (endpoint: string) => {
    let url = netboxUrl + endpoint;
    const results = [];
    while (url) {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch " + url + ": " + res.statusText);
      const data = await res.json();
      results.push(...(data.results || []));
      url = data.next;
    }
    return results;
  };

  const [sitesData, locationsData, racksData, deviceTypesData, devicesData, cablesData] = await Promise.all([
    fetchAll('/api/dcim/sites/'),
    fetchAll('/api/dcim/locations/'),
    fetchAll('/api/dcim/racks/'),
    fetchAll('/api/dcim/device-types/'),
    fetchAll('/api/dcim/devices/'),
    fetchAll('/api/dcim/cables/'),
  ]);

  const sites: Site[] = sitesData.map((s: any) => ({
    id: String(s.id),
    name: s.name,
    slug: s.slug,
    description: s.description || undefined,
  }));

  const locations: Location[] = locationsData.map((l: any) => ({
    id: String(l.id),
    name: l.name,
    slug: l.slug,
    siteId: String(l.site?.id ?? l.site),
    parentId: l.parent ? String(l.parent?.id ?? l.parent) : undefined,
    description: l.description || undefined,
  }));

  const racks: Rack[] = racksData.map((r: any) => ({
    id: String(r.id),
    name: r.name,
    siteId: String(r.site?.id ?? r.site),
    locationId: r.location ? String(r.location?.id ?? r.location) : undefined,
    uHeight: r.u_height,
    status: r.status?.value ?? r.status ?? 'active',
    width: r.width ? (typeof r.width === 'object' ? r.width.value : r.width) : undefined,
    description: r.description || undefined,
  }));

  const deviceTypes: DeviceType[] = deviceTypesData.map((dt: any) => ({
    id: String(dt.id),
    manufacturer: dt.manufacturer?.name ?? dt.manufacturer ?? 'Unknown',
    model: dt.model,
    slug: dt.slug,
    uHeight: dt.u_height,
    isFullDepth: dt.is_full_depth ?? true,
    weight: dt.weight || undefined,
    description: dt.description || undefined,
  }));

  const devices: Device[] = devicesData.map((d: any) => ({
    id: String(d.id),
    name: d.name || undefined,
    deviceTypeId: String(d.device_type?.id ?? d.device_type),
    siteId: String(d.site?.id ?? d.site),
    locationId: d.location ? String(d.location?.id ?? d.location) : undefined,
    rackId: d.rack ? String(d.rack?.id ?? d.rack) : undefined,
    position: d.position || undefined,
    status: d.status?.value ?? d.status ?? 'active',
    description: d.description || undefined,
  }));

  const cables: Cable[] = cablesData.map((c: any) => {
    const termA = c.a_terminations ? c.a_terminations[0] : c.termination_a;
    const termB = c.b_terminations ? c.b_terminations[0] : c.termination_b;

    if (!termA || !termB) {
      throw new Error("Cable " + c.id + " is missing a termination");
    }

    const mapTermination = (term: any): CableTermination => {
      const objType = term.object_type || (term.object_type === undefined && term.device ? 'dcim.interface' : '');
      let kind: 'interface' | 'frontPort' | 'rearPort' | 'consolePort' | 'powerPort' = 'interface';
      if (objType.includes('frontport')) kind = 'frontPort';
      else if (objType.includes('rearport')) kind = 'rearPort';
      else if (objType.includes('consoleport')) kind = 'consolePort';
      else if (objType.includes('powerport')) kind = 'powerPort';

      return {
        deviceId: String(term.device?.id ?? term.device ?? (term.device_id ?? 'Unknown')),
        portRef: {
          kind,
          name: term.name || 'Unknown',
        },
      };
    };

    return {
      id: String(c.id),
      terminations: [mapTermination(termA), mapTermination(termB)],
      status: c.status?.value ?? c.status ?? 'connected',
      type: c.type || undefined,
      lengthM: c.length || undefined,
      label: c.label || undefined,
      color: c.color || undefined,
      description: c.description || undefined,
    };
  });

  const devicePorts = new Map<string, { kind: string, name: string }[]>();
  
  cables.forEach(c => {
    c.terminations.forEach(t => {
      const ports = devicePorts.get(t.deviceId) || [];
      ports.push({ kind: t.portRef.kind, name: t.portRef.name });
      devicePorts.set(t.deviceId, ports);
    });
  });

  devices.forEach(d => {
    const ports = devicePorts.get(d.id) || [];
    ports.forEach(p => {
      if (p.kind === 'interface') {
        if (!d.interfaces) d.interfaces = [];
        if (!d.interfaces.some(i => i.name === p.name)) d.interfaces.push({ id: d.id + "-" + p.name, name: p.name, type: "1000base-t" });
      }
      else if (p.kind === 'frontPort') {
        if (!d.frontPorts) d.frontPorts = [];
        if (!d.frontPorts.some(i => i.name === p.name)) d.frontPorts.push({ id: d.id + "-" + p.name, name: p.name, type: "8p8c" });
      }
      else if (p.kind === 'rearPort') {
        if (!d.rearPorts) d.rearPorts = [];
        if (!d.rearPorts.some(i => i.name === p.name)) d.rearPorts.push({ id: d.id + "-" + p.name, name: p.name, type: "8p8c", positions: 1 });
      }
      else if (p.kind === 'consolePort') {
        if (!d.consolePorts) d.consolePorts = [];
        if (!d.consolePorts.some(i => i.name === p.name)) d.consolePorts.push({ id: d.id + "-" + p.name, name: p.name, type: "rj-45" });
      }
      else if (p.kind === 'powerPort') {
        if (!d.powerPorts) d.powerPorts = [];
        if (!d.powerPorts.some(i => i.name === p.name)) d.powerPorts.push({ id: d.id + "-" + p.name, name: p.name, type: "iec-60320-c14" });
      }
    });
  });

  const doc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'NetBox Import',
    sites,
    locations,
    racks,
    deviceTypes,
    devices,
    cables,
    signalClasses: [],
  };

  return DesignDocumentSchema.parse(doc);
}
