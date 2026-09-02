import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoverageOverlay } from './CoverageOverlay';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';
import * as acoustics from '@copper/acoustics';

vi.mock('@copper/acoustics', async () => {
  const actual = await vi.importActual<typeof acoustics>('@copper/acoustics');
  return {
    ...actual,
    computeRoomCoverage: vi.fn(() => [{ totalSpl: 95 }])
  };
});

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ size: { width: 100, height: 100 } })
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockDoc: DesignDocument = {
  schemaVersion: 1, designLabel: 'Test Doc',
  deviceTypes: [
    {
      id: 'sub1',
      manufacturer: 'Brand',
      model: 'Spk1',
      slug: 'brand-spk1', uHeight: 1, isFullDepth: false,
      customFields: {
        acoustics: { device_class: 'speaker' }
      }
    }
  ],
  sites: [],
  locations: [], signalClasses: [], zones: [], devices: [
    {
      id: 'dev1',
      deviceTypeId: 'sub1',
      siteId: 'site-1',
      name: 'Test Speaker',
      status: 'planned'
    }
  ],
  racks: [],
  cables: []
};

describe('CoverageOverlay', () => {
  beforeEach(() => {
    useDocumentStore.setState({ document: JSON.parse(JSON.stringify(mockDoc)) });
    vi.clearAllMocks();
  });

  it('renders without crashing and computes room coverage', () => {
    const { container } = render(<CoverageOverlay />);
    expect(acoustics.computeRoomCoverage).toHaveBeenCalled();
    expect(container.querySelector('group')).toBeTruthy();
  });

  it('renders nothing if no speakers in document', () => {
    useDocumentStore.setState({ document: { ...mockDoc, locations: [], signalClasses: [], zones: [], devices: [] } });
    const { container } = render(<CoverageOverlay />);
    expect(acoustics.computeRoomCoverage).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe('');
  });
});
