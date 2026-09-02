import { DesignDocument, Device, DeviceType, Site, Location, Cable } from '@copper/schema';
import crypto from 'crypto';

function uuid() {
    return crypto.randomUUID().replace(/-/g, '');
}

export function importConnectCAD(devicesCsv: string, circuitsCsv: string): DesignDocument {
    // 1. Create default Site and Location
    const siteId = uuid();
    const locId = uuid();
    const site: Site = { id: siteId, name: 'Default Site', slug: 'default-site' };
    const location: Location = { id: locId, name: 'Default Location', slug: 'default-location', siteId: siteId };

    const deviceTypes: DeviceType[] = [];
    const devices: Device[] = [];
    const cables: Cable[] = [];

    // Maps to avoid duplicates
    const dtMap = new Map<string, DeviceType>(); // make|model -> DeviceType
    const devMap = new Map<string, Device>(); // name -> Device
    const devInterfaces = new Map<string, Set<string>>(); // deviceName -> set of port names

    // Parse devices
    const devLines = devicesCsv.trim().split('\n');
    const devHeader = devLines[0].split(',').map(s => s.trim().toLowerCase());
    const nameIdx = devHeader.indexOf('device');
    const makeIdx = devHeader.indexOf('make');
    const modelIdx = devHeader.indexOf('model');

    for (let i = 1; i < devLines.length; i++) {
        if (!devLines[i].trim()) continue;
        const parts = devLines[i].split(',').map(s => s.trim());
        const name = nameIdx >= 0 ? parts[nameIdx] : `Dev${i}`;
        const make = makeIdx >= 0 ? parts[makeIdx] : 'UnknownMake';
        const model = modelIdx >= 0 ? parts[modelIdx] : 'UnknownModel';

        const dtKey = `${make}|${model}`;
        let dt = dtMap.get(dtKey);
        if (!dt) {
            dt = {
                id: uuid(),
                manufacturer: make,
                model: model,
                slug: `${make}-${model}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                uHeight: 1,
                isFullDepth: true
            };
            dtMap.set(dtKey, dt);
            deviceTypes.push(dt);
        }

        const dev: Device = {
            id: uuid(),
            name: name,
            deviceTypeId: dt.id,
            siteId: site.id,
            locationId: location.id,
            status: 'planned',
            interfaces: []
        };
        devMap.set(name, dev);
        devices.push(dev);
        devInterfaces.set(name, new Set());
    }

    // Parse circuits
    const circLines = circuitsCsv.trim().split('\n');
    if (circLines.length > 0) {
        const circHeader = circLines[0].split(',').map(s => s.trim().toLowerCase());
        const srcDevIdx = circHeader.indexOf('source device');
        const srcSockIdx = circHeader.indexOf('source socket');
        const dstDevIdx = circHeader.indexOf('dest device');
        const dstSockIdx = circHeader.indexOf('dest socket');

        for (let i = 1; i < circLines.length; i++) {
            if (!circLines[i].trim()) continue;
            const parts = circLines[i].split(',').map(s => s.trim());
            const srcDevName = srcDevIdx >= 0 ? parts[srcDevIdx] : '';
            const srcSockName = srcSockIdx >= 0 ? parts[srcSockIdx] : '';
            const dstDevName = dstDevIdx >= 0 ? parts[dstDevIdx] : '';
            const dstSockName = dstSockIdx >= 0 ? parts[dstSockIdx] : '';

            const srcDev = devMap.get(srcDevName);
            const dstDev = devMap.get(dstDevName);

            if (!srcDev || !dstDev) continue;
            if (!srcSockName || !dstSockName) continue;

            // Add ports if not exist
            if (!devInterfaces.get(srcDevName)!.has(srcSockName)) {
                devInterfaces.get(srcDevName)!.add(srcSockName);
                srcDev.interfaces!.push({
                    id: uuid(),
                    name: srcSockName,
                    type: '1000base-t'
                });
            }
            if (!devInterfaces.get(dstDevName)!.has(dstSockName)) {
                devInterfaces.get(dstDevName)!.add(dstSockName);
                dstDev.interfaces!.push({
                    id: uuid(),
                    name: dstSockName,
                    type: '1000base-t'
                });
            }

            const cable: Cable = {
                id: uuid(),
                status: 'planned',
                terminations: [
                    {
                        deviceId: srcDev.id,
                        portRef: { kind: 'interface', name: srcSockName }
                    },
                    {
                        deviceId: dstDev.id,
                        portRef: { kind: 'interface', name: dstSockName }
                    }
                ]
            };
            cables.push(cable);
        }
    }

    const doc: DesignDocument = {
        schemaVersion: 1,
        designLabel: 'ConnectCAD Import',
        sites: [site],
        locations: [location],
        deviceTypes: deviceTypes,
        devices: devices,
        cables: cables,
        racks: [],
        signalClasses: []
    };

    return doc;
}

