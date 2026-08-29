import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { LocationTree } from './LocationTree';
import { DesignDocument } from '../../model/schema';

test('Component correctly nests Locations under Sites and Locations under parent Locations', () => {
  const mockDoc = {
    schemaVersion: 1,
    designLabel: 'Test Design',
    sites: [
      { id: 's1', name: 'Site 1', slug: 'site-1' }
    ],
    locations: [
      { id: 'l1', name: 'Location 1', slug: 'loc-1', siteId: 's1' },
      { id: 'l2', name: 'Location 2', slug: 'loc-2', siteId: 's1' },
      { id: 'l3', name: 'Location 3 (Child of 1)', slug: 'loc-3', siteId: 's1', parentId: 'l1' }
    ],
    racks: [],
    deviceTypes: [],
    devices: [],
    cables: [],
    signalClasses: []
  } as unknown as DesignDocument;

  render(<LocationTree document={mockDoc} />);

  // Assert top-level tree exists
  const tree = screen.getByTestId('location-tree');
  expect(tree).toBeDefined();

  // Assert Site 1 is rendered
  const site1 = screen.getByTestId('site-s1');
  expect(site1.textContent).toContain('Site 1');

  // Assert Root Locations are under Site 1
  const site1LocationsList = within(site1).getByTestId('site-locations-s1');
  
  // CORRECTION: Ensure only exactly the 2 root locations are rendered at this level.
  // This explicitly catches the flat-rendering mutation.
  expect(site1LocationsList.children.length).toBe(2);

  const loc1 = within(site1LocationsList).getByTestId('location-l1');
  const loc2 = within(site1LocationsList).getByTestId('location-l2');
  expect(loc1).toBeDefined();
  expect(loc2).toBeDefined();

  // Assert nested location is under Location 1
  const loc1ChildrenList = within(loc1).getByTestId('location-children-l1');
  
  // CORRECTION: Ensure exactly 1 child is rendered at this level.
  expect(loc1ChildrenList.children.length).toBe(1);
  
  const loc3 = within(loc1ChildrenList).getByTestId('location-l3');
  expect(loc3).toBeDefined();

  // Assert loc2 has no children list
  const loc2ChildrenList = within(loc2).queryByTestId('location-children-l2');
  expect(loc2ChildrenList).toBeNull();
});
