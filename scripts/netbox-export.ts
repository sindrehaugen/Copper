/* eslint-disable */
import type { DesignDocument, Site, Location, Rack, DeviceType, Device, Cable } from '@copper/schema';

export async function exportToNetBox(doc: DesignDocument, netboxUrl: string, ) {
  const headers = {
    'Authorization': "Token ",
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const post = async (endpoint: string, data: any) => {
    const url = new URL(endpoint, netboxUrl).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error("NetBox API Error on :   - ");
    }
    return res.json();
  };

  for (const site of doc.sites) {
    await post('/api/dcim/sites/', site);
  }
  for (const loc of doc.locations) {
    await post('/api/dcim/locations/', loc);
  }
  for (const rack of doc.racks) {
    await post('/api/dcim/racks/', rack);
  }
  for (const dt of doc.deviceTypes) {
    await post('/api/dcim/device-types/', dt);
  }
  for (const dev of doc.devices) {
    await post('/api/dcim/devices/', dev);
  }
  for (const cable of doc.cables) {
    await post('/api/dcim/cables/', cable);
  }
}

