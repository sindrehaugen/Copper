import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SubArrayPanel } from './SubArrayPanel';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, def?: string) => def || key.split('.').pop()
  })
}));

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(50 * 50 * 4) })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
  })) as any;
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockDoc: DesignDocument = {
  schemaVersion: 1, designLabel: 'Test Doc',
  deviceTypes: [
    {
      id: 'sub1',
      manufacturer: 'L-Acoustics',
      model: 'KS28',
      slug: 'l-acoustics-ks28', uHeight: 1, isFullDepth: false,
      customFields: {
        acoustics: { device_class: 'speaker' }
      }
    }
  ],
  sites: [{ id: 'site-1', name: 'Main', slug: 'main' }],
  locations: [], signalClasses: [], zones: [], devices: [],
  racks: [],
  cables: []
};

describe('SubArrayPanel', () => {
  beforeEach(() => {
    useDocumentStore.setState({ document: JSON.parse(JSON.stringify(mockDoc)) });
  });

  it('renders and places array devices in documentStore', () => {
    render(<SubArrayPanel />);

    const openBtn = screen.getByRole('button', { name: /open/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Sub Array Designer/i)).toBeTruthy();

    const placeBtn = screen.getByRole('button', { name: /place/i });
    fireEvent.click(placeBtn);

    const doc = useDocumentStore.getState().document;
    expect(doc!.devices.length).toBe(4);
    expect(doc!.devices[0]!.deviceTypeId).toBe('sub1');
    expect(doc!.devices[0]!.name).toContain('Endfire');
  });
});
