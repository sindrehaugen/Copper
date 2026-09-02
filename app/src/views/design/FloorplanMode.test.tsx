import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { FloorplanMode } from './FloorplanMode';
import { useDocumentStore } from '../../store/documentStore';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('FloorplanMode', () => {
  beforeEach(() => {
    // Reset store state
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'Test Design',
        sites: [],
        locations: [],
        racks: [],
        deviceTypes: [],
        cables: [],
        signalClasses: [],
        zones: [],
        devices: [
          {
            id: 'dev-1',
            name: 'Speaker',
            deviceTypeId: 'dt-1',
            siteId: 'site-1',
            status: 'active'
          }
        ],
        geometry: {}
      },
      selectedIds: [],
    });
  });

  it('updates geometry in document store when dragging a device', () => {
    render(<FloorplanMode />);

    // Find the device
    const device = screen.getByTitle('Speaker');
    
    // movementX and movementY are used in FloorplanMode.tsx
    // Let's create an event with those properties since fireEvent wrapper might drop them
    const moveEvent = new Event('pointermove', { bubbles: true, cancelable: true });
    Object.assign(moveEvent, { movementX: 50, movementY: 30 });

    const downEvent = new Event('pointerdown', { bubbles: true, cancelable: true });
    Object.assign(downEvent, { pointerId: 1 });
    
    device.setPointerCapture = vi.fn();
    device.releasePointerCapture = vi.fn();

    fireEvent(device, downEvent);
    fireEvent(device, moveEvent);

    const upEvent = new Event('pointerup', { bubbles: true, cancelable: true });
    Object.assign(upEvent, { pointerId: 1 });
    fireEvent(device, upEvent);

    // Verify the store was updated
    const { document } = useDocumentStore.getState();
    expect(document?.geometry?.['dev-1']?.position).toEqual({ x: 50, y: 30 });
  });
});
