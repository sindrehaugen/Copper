 
import * as yaml from 'js-yaml';
import { DeviceType } from '../../app/src/model/schema';

export function parseDeviceType(yamlString: string): { deviceType: DeviceType; unknownKeys: string[] } {
  let parsed: any;
  try {
    parsed = yaml.load(yamlString);
  } catch (err) {
    throw new Error(`Invalid YAML: ${(err as Error).message}`);
  }
  
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid YAML: root is not an object');
  }

  const raw = parsed as Record<string, any>;
  const unknownKeys: string[] = [];
  
  const knownKeys = new Set([
    'manufacturer', 'model', 'slug', 'u_height', 'is_full_depth', 'weight', 'airflow', 'description',
    'interfaces', 'front-ports', 'rear-ports', 'console-ports', 'power-ports', 'power-outlets',
    'module-bays', 'device-bays', 'part_number', 'comments'
  ]);

  for (const key of Object.keys(raw)) {
    if (!knownKeys.has(key)) {
      unknownKeys.push(key);
    }
  }

  const mapInterface = (i: any) => ({
    name: i.name,
    label: i.label,
    type: i.type,
    mgmtOnly: i.mgmt_only,
    description: i.description,
  });

  const mapFrontPort = (p: any) => ({
    name: p.name,
    label: p.label,
    type: p.type,
    rearPortId: p.rear_port,
    rearPortPosition: p.rear_port_position,
    description: p.description,
  });

  const mapRearPort = (p: any) => ({
    name: p.name,
    label: p.label,
    type: p.type,
    positions: p.positions,
    description: p.description,
  });

  const mapConsolePort = (p: any) => ({
    name: p.name,
    label: p.label,
    type: p.type,
    description: p.description,
  });

  const mapPowerPort = (p: any) => ({
    name: p.name,
    label: p.label,
    type: p.type,
    maximumDrawWatts: p.maximum_draw,
    allocatedDrawWatts: p.allocated_draw,
    description: p.description,
  });

  const mapPowerOutlet = (p: any) => ({
    name: p.name,
    label: p.label,
    type: p.type,
    powerPortId: p.power_port,
    feedLeg: p.feed_leg,
    description: p.description,
  });

  const mapModuleBay = (b: any) => ({
    name: b.name,
    label: b.label,
    position: b.position?.toString(),
    description: b.description,
  });

  const mapDeviceBay = (b: any) => ({
    name: b.name,
    label: b.label,
    description: b.description,
  });

  // Strip undefined
  const strip = (obj: any) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
  };

  const deviceType: any = {
    id: raw.slug || 'unknown-id',
    manufacturer: raw.manufacturer,
    model: raw.model,
    slug: raw.slug,
    uHeight: raw.u_height,
    isFullDepth: raw.is_full_depth,
    weight: raw.weight,
    airflow: raw.airflow,
    description: raw.description,
    interfaceTemplates: raw.interfaces?.map((i: any) => strip(mapInterface(i))),
    frontPortTemplates: raw['front-ports']?.map((p: any) => strip(mapFrontPort(p))),
    rearPortTemplates: raw['rear-ports']?.map((p: any) => strip(mapRearPort(p))),
    consolePortTemplates: raw['console-ports']?.map((p: any) => strip(mapConsolePort(p))),
    powerPortTemplates: raw['power-ports']?.map((p: any) => strip(mapPowerPort(p))),
    powerOutletTemplates: raw['power-outlets']?.map((p: any) => strip(mapPowerOutlet(p))),
    moduleBayTemplates: raw['module-bays']?.map((b: any) => strip(mapModuleBay(b))),
    deviceBayTemplates: raw['device-bays']?.map((b: any) => strip(mapDeviceBay(b))),
  };

  strip(deviceType);

  return { deviceType: deviceType as DeviceType, unknownKeys };
}
