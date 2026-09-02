import type { DesignDocument, Site, Location, Device, Rack, DeviceType, } from '@copper/schema';

export function exportCOBie(doc: DesignDocument): Record<string, string> {
  const createdBy = 'Copper';
  const createdOn = new Date().toISOString();
  
  const toCSV = (headers: string[], rows: (string | number | undefined | null)[][]) => {
     
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');
  };

  const facilityHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Category', 'ProjectName', 'SiteName', 'LinearUnits', 'AreaUnits', 'VolumeUnits', 'CurrencyUnit', 'AreaMeasurement', 'ExternalSystem', 'ExternalProjectObject', 'ExternalFacilityObject', 'Description'];
  const facilityRows = [
    [
      doc.designLabel || 'Copper Facility',
      createdBy,
      createdOn,
      'Facility',
      doc.designLabel || 'Project',
      doc.sites?.[0]?.name || 'Site',
      'millimeters',
      'squaremeters',
      'cubicmeters',
      'USD',
      '',
      'Copper',
      'DesignDocument',
      '',
      `Revision: ${doc.revision || '1.0'}`
    ]
  ];

  const childMap = new Map<string, Location[]>();
  for (const loc of doc.locations || []) {
    const parentId = loc.parentId || loc.siteId;
    if (!childMap.has(parentId)) {
      childMap.set(parentId, []);
    }
    childMap.get(parentId)!.push(loc);
  }
  
  const isSpace = (loc: Location) => {
    return !childMap.has(loc.id) || childMap.get(loc.id)!.length === 0;
  };
  
  const floorHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Category', 'ExtSystem', 'ExtObject', 'ExtIdentifier', 'Description', 'Elevation', 'Height'];
   
  const floorRows: any[][] = [];
  
  for (const site of doc.sites || []) {
    floorRows.push([
      site.name, createdBy, createdOn, 'Site', 'Copper', 'Site', site.id, site.description, '', ''
    ]);
  }
  for (const loc of doc.locations || []) {
    if (!isSpace(loc)) {
      floorRows.push([
        loc.name, createdBy, createdOn, 'Floor', 'Copper', 'Location', loc.id, loc.description, loc.position?.[2] ?? '', ''
      ]);
    }
  }

  const spaceHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Category', 'FloorName', 'Description', 'ExtSystem', 'ExtObject', 'ExtIdentifier', 'RoomTag', 'UsableHeight', 'GrossArea', 'NetArea'];
   
  const spaceRows: any[][] = [];
  
  const locMap = new Map<string, Location | Site>();
  for (const s of doc.sites || []) locMap.set(s.id, s);
  for (const l of doc.locations || []) locMap.set(l.id, l);
  
  const getParentName = (loc: Location) => {
    const parentId = loc.parentId || loc.siteId;
    const parent = locMap.get(parentId);
    return parent ? parent.name : '';
  };
  
  for (const loc of doc.locations || []) {
    if (isSpace(loc)) {
      spaceRows.push([
        loc.name, createdBy, createdOn, 'Space', getParentName(loc), loc.description, 'Copper', 'Location', loc.id, '', '', '', ''
      ]);
    }
  }

  const typeHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Category', 'Description', 'AssetType', 'Manufacturer', 'ModelNumber', 'WarrantyGuarantorParts', 'WarrantyDurationParts', 'WarrantyGuarantorLabor', 'WarrantyDurationLabor', 'WarrantyDurationUnit', 'ExtSystem', 'ExtObject', 'ExtIdentifier'];
   
  const typeRows: any[][] = [];
  
  for (const dt of doc.deviceTypes || []) {
    typeRows.push([
      `${dt.manufacturer} ${dt.model}`, createdBy, createdOn, 'DeviceType', dt.description, 'Fixed', dt.manufacturer, dt.model, '', '', '', '', '', 'Copper', 'DeviceType', dt.id
    ]);
  }

  const componentHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Space', 'TypeName', 'ExtSystem', 'ExtObject', 'ExtIdentifier', 'Description', 'SerialNumber', 'InstallationDate', 'WarrantyStartDate', 'AssetIdentifier'];
   
  const componentRows: any[][] = [];
  
  const typeMap = new Map<string, DeviceType>();
  for (const dt of doc.deviceTypes || []) typeMap.set(dt.id, dt);
  
  const getSpaceNameForDevice = (d: Device | Rack) => {
    if (d.locationId) {
      const loc = locMap.get(d.locationId);
      return loc ? loc.name : '';
    }
    if (d.siteId) {
      const site = locMap.get(d.siteId);
      return site ? site.name : '';
    }
    return '';
  };

  for (const rack of doc.racks || []) {
    componentRows.push([
      rack.name, createdBy, createdOn, getSpaceNameForDevice(rack), 'Rack', 'Copper', 'Rack', rack.id, rack.description, '', '', '', ''
    ]);
  }
  
  for (const dev of doc.devices || []) {
    const type = typeMap.get(dev.deviceTypeId);
    const typeName = type ? `${type.manufacturer} ${type.model}` : '';
    const name = dev.designation || dev.name || dev.id;
    
    componentRows.push([
      name, createdBy, createdOn, getSpaceNameForDevice(dev), typeName, 'Copper', 'Device', dev.id, dev.description, '', '', '', dev.designation || ''
    ]);
  }

  const systemHeaders = ['Name', 'CreatedBy', 'CreatedOn', 'Category', 'ComponentNames', 'ExtSystem', 'ExtObject', 'ExtIdentifier', 'Description'];
   
  const systemRows: any[][] = [];
  
  for (const sc of doc.signalClasses || []) {
    const relatedComponents: string[] = [];
    for (const dev of doc.devices || []) {
      let hasSignal = false;
      const allPorts = [
        ...(dev.interfaces || []),
        ...(dev.frontPorts || []),
        ...(dev.rearPorts || []),
        ...(dev.consolePorts || []),
        ...(dev.powerPorts || []),
        ...(dev.powerOutlets || [])
      ];
      if (allPorts.some(p => p.signalClassId === sc.id)) {
        hasSignal = true;
      }
      if (hasSignal) {
        relatedComponents.push(dev.designation || dev.name || dev.id);
      }
    }
    
    systemRows.push([
      sc.name, createdBy, createdOn, sc.category, relatedComponents.join(','), 'Copper', 'SignalClass', sc.id, sc.description
    ]);
  }

  return {
    'Facility': toCSV(facilityHeaders, facilityRows),
    'Floor': toCSV(floorHeaders, floorRows),
    'Space': toCSV(spaceHeaders, spaceRows),
    'Type': toCSV(typeHeaders, typeRows),
    'Component': toCSV(componentHeaders, componentRows),
    'System': toCSV(systemHeaders, systemRows),
  };
}

