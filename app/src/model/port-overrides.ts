import { Device, DeviceType, FrontPort, RearPort, Interface, ConsolePort, PowerPort, PowerOutlet } from './schema';

export type ResolvedPort = 
  | (Omit<Interface, 'id'> & { kind: 'interface', id?: string })
  | (Omit<FrontPort, 'id' | 'rearPortId'> & { kind: 'frontPort', id?: string, rearPortId?: string })
  | (Omit<RearPort, 'id'> & { kind: 'rearPort', id?: string })
  | (Omit<ConsolePort, 'id'> & { kind: 'consolePort', id?: string })
  | (Omit<PowerPort, 'id'> & { kind: 'powerPort', id?: string })
  | (Omit<PowerOutlet, 'id'> & { kind: 'powerOutlet', id?: string });

function merge<T extends object>(template: Record<string, unknown>, override: Record<string, unknown> | undefined, defaults: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...template };
  if (override) {
    for (const key of Object.keys(override)) {
      if (override[key] !== undefined) {
        result[key] = override[key];
      }
    }
  }
  for (const key of Object.keys(defaults)) {
    if (result[key] === undefined) {
      result[key] = defaults[key];
    }
  }
  return result as unknown as T;
}

export function resolveDevicePorts(device: Device, deviceType: DeviceType): ResolvedPort[] {
  const resolved: ResolvedPort[] = [];

  const frontTemplates = deviceType.frontPortTemplates || [];
  const frontOverrides = device.frontPorts || [];
  const frontOverridesMap = new Map(frontOverrides.map(p => [p.name, p]));
  for (const template of frontTemplates) {
    const override = frontOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'frontPort', ...template }, override as Record<string, unknown> | undefined, { 
      rearPortId: template.rearPortId, 
      rearPortPosition: template.rearPortPosition 
    }));
  }
  for (const override of frontOverrides) {
    if (!frontTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'frontPort' }, override as Record<string, unknown>, {}));
    }
  }

  const rearTemplates = deviceType.rearPortTemplates || [];
  const rearOverrides = device.rearPorts || [];
  const rearOverridesMap = new Map(rearOverrides.map(p => [p.name, p]));
  for (const template of rearTemplates) {
    const override = rearOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'rearPort', ...template }, override as Record<string, unknown> | undefined, { 
      positions: template.positions 
    }));
  }
  for (const override of rearOverrides) {
    if (!rearTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'rearPort' }, override as Record<string, unknown>, {}));
    }
  }

  const interfaceTemplates = deviceType.interfaceTemplates || [];
  const interfaceOverrides = device.interfaces || [];
  const interfaceOverridesMap = new Map(interfaceOverrides.map(p => [p.name, p]));
  for (const template of interfaceTemplates) {
    const override = interfaceOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'interface', ...template }, override as Record<string, unknown> | undefined, {}));
  }
  for (const override of interfaceOverrides) {
    if (!interfaceTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'interface' }, override as Record<string, unknown>, {}));
    }
  }

  const consoleTemplates = deviceType.consolePortTemplates || [];
  const consoleOverrides = device.consolePorts || [];
  const consoleOverridesMap = new Map(consoleOverrides.map(p => [p.name, p]));
  for (const template of consoleTemplates) {
    const override = consoleOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'consolePort', ...template }, override as Record<string, unknown> | undefined, {}));
  }
  for (const override of consoleOverrides) {
    if (!consoleTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'consolePort' }, override as Record<string, unknown>, {}));
    }
  }

  const powerPortTemplates = deviceType.powerPortTemplates || [];
  const powerPortOverrides = device.powerPorts || [];
  const powerPortOverridesMap = new Map(powerPortOverrides.map(p => [p.name, p]));
  for (const template of powerPortTemplates) {
    const override = powerPortOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'powerPort', ...template }, override as Record<string, unknown> | undefined, {}));
  }
  for (const override of powerPortOverrides) {
    if (!powerPortTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'powerPort' }, override as Record<string, unknown>, {}));
    }
  }

  const powerOutletTemplates = deviceType.powerOutletTemplates || [];
  const powerOutletOverrides = device.powerOutlets || [];
  const powerOutletOverridesMap = new Map(powerOutletOverrides.map(p => [p.name, p]));
  for (const template of powerOutletTemplates) {
    const override = powerOutletOverridesMap.get(template.name);
    resolved.push(merge({ kind: 'powerOutlet', ...template }, override as Record<string, unknown> | undefined, {}));
  }
  for (const override of powerOutletOverrides) {
    if (!powerOutletTemplates.find(t => t.name === override.name)) {
      resolved.push(merge({ kind: 'powerOutlet' }, override as Record<string, unknown>, {}));
    }
  }

  return resolved;
}
