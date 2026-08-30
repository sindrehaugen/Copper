import React, { useState } from 'react';
import { useDocumentStore } from '../../store/documentStore';
import type { Device } from '../../model/schema';

export function DevicePalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const document = useDocumentStore((state) => state.document);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  if (!document) {
    return <div data-testid="device-palette-empty">No document loaded</div>;
  }

  const deviceTypes = document.deviceTypes || [];

  const filteredTypes = deviceTypes.filter((dt) => {
    const search = searchTerm.toLowerCase();
    return (
      dt.manufacturer.toLowerCase().includes(search) ||
      dt.model.toLowerCase().includes(search) ||
      dt.id.toLowerCase().includes(search)
    );
  });

  const handleAddDevice = (deviceTypeId: string) => {
    updateDocument((draft) => {
      // Pick a site or fallback to a string that passes the schema
      const siteId = draft.sites.length > 0 ? draft.sites[0].id : 'default-site';
      
      const newDevice: Device = {
        id: crypto.randomUUID(),
        deviceTypeId,
        siteId,
        status: 'planned'
      };
      
      draft.devices.push(newDevice);
    });
  };

  return (
    <div className="device-palette">
      <h2>Palette</h2>
      <input
        type="text"
        placeholder="Search devices..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        data-testid="device-palette-search"
      />
      <ul data-testid="device-palette-list">
        {filteredTypes.map((dt) => (
          <li key={dt.id} data-testid={`device-type-${dt.id}`}>
            <div>
              <span>{dt.manufacturer}</span> - <span>{dt.model}</span>
            </div>
            <button
              onClick={() => handleAddDevice(dt.id)}
              data-testid={`add-device-${dt.id}`}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
