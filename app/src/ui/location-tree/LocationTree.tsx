import React from 'react';
import { DesignDocument, Location } from '../../model/schema';

export interface LocationTreeProps {
  document: DesignDocument;
}

export const LocationTree: React.FC<LocationTreeProps> = ({ document }) => {
  const { sites = [], locations = [] } = document;

  const getRootLocationsForSite = (siteId: string) => {
    return locations.filter((loc) => loc.siteId === siteId && !loc.parentId);
  };

  const getChildLocations = (parentId: string) => {
    return locations.filter((loc) => loc.parentId === parentId);
  };

  const renderLocation = (location: Location) => {
    const children = getChildLocations(location.id);
    return (
      <li key={location.id} data-testid={`location-${location.id}`}>
        {location.name}
        {children.length > 0 && (
          <ul data-testid={`location-children-${location.id}`}>
            {children.map((child) => renderLocation(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul data-testid="location-tree">
      {sites.map((site) => {
        const rootLocations = getRootLocationsForSite(site.id);
        return (
          <li key={site.id} data-testid={`site-${site.id}`}>
            {site.name}
            {rootLocations.length > 0 && (
              <ul data-testid={`site-locations-${site.id}`}>
                {rootLocations.map((loc) => renderLocation(loc))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};
