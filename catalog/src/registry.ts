import { DeviceType } from '../../app/src/model/schema';
import { walkDirectory } from './walker';

export class CatalogRegistry {
  private devices = new Map<string, DeviceType>();

  async initialize(dirPath: string): Promise<void> {
    this.devices = await walkDirectory(dirPath);
  }

  getDeviceType(id: string): DeviceType | undefined {
    return this.devices.get(id);
  }

  getAllDeviceTypes(): DeviceType[] {
    return Array.from(this.devices.values());
  }
}

const defaultRegistry = new CatalogRegistry();

export async function initialize(dirPath: string): Promise<void> {
  return defaultRegistry.initialize(dirPath);
}

export function getDeviceType(id: string): DeviceType | undefined {
  return defaultRegistry.getDeviceType(id);
}

export function getAllDeviceTypes(): DeviceType[] {
  return defaultRegistry.getAllDeviceTypes();
}
