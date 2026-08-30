/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProvenanceViewer, ProvenanceRecord } from './ProvenanceViewer';

describe('ProvenanceViewer', () => {
  const mockRecords: ProvenanceRecord[] = [
    {
      id: '1',
      timestamp: '2026-08-30T12:00:00Z',
      actor: 'Admin',
      action: 'Updated value',
      originalValue: 'Old value',
      newValue: 'Brand new value',
      citation: 'C9a'
    }
  ];

  it('renders no records message', () => {
    render(<ProvenanceViewer records={[]} />);
    expect(screen.getByText(/No provenance records available/i)).toBeDefined();
  });

  it('renders records correctly', () => {
    render(<ProvenanceViewer records={mockRecords} />);
    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByText('Updated value')).toBeDefined();
    expect(screen.getByText('Old value')).toBeDefined();
    expect(screen.getByText('Brand new value')).toBeDefined();
    expect(screen.getByText(/C9a/i)).toBeDefined();
  });
});
