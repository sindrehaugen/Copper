import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../../store/documentStore';
import { useFindings, normalizeEntityRef, type Finding, type FindingSeverity } from '../../shell/finding';

export interface EstateCoordinates {
  lng: number;
  lat: number;
}

export type CoordinateTuple = [number, number]; // [lng, lat]

export interface EstateSite {
  id: string;
  name: string;
  slug?: string | undefined;
  description?: string | undefined;
  coordinates?: CoordinateTuple | undefined;
  polygon?: CoordinateTuple[] | undefined;
}

export interface EstateBuilding {
  id: string;
  siteId: string;
  name: string;
  slug?: string | undefined;
  description?: string | undefined;
  coordinates?: CoordinateTuple | undefined;
  polygon?: CoordinateTuple[] | undefined;
}

export interface EstateMapConfig {
  styleUrl?: string | undefined;
  apiKey?: string | undefined;
  tileProvider?: 'kartverket' | 'osm' | 'custom' | undefined;
}

export interface EstateMapProps {
  siteId?: string | undefined;
  sites?: EstateSite[] | undefined;
  buildings?: EstateBuilding[] | undefined;
  findings?: Finding[] | undefined;
  config?: EstateMapConfig | undefined;
  onNavigate?: ((path: string, entity: { id: string; type: 'site' | 'building'; name: string }) => void) | undefined;
  onSelectEntity?: ((entity: { id: string; type: 'site' | 'building'; name: string }) => void) | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export interface HealthRollup {
  status: 'critical' | 'warning' | 'healthy';
  highestSeverity: FindingSeverity | 'none';
  slaStatus: 'breached' | 'at_risk' | 'healthy';
  findings: Finding[];
}

/**
 * Computes health and SLA rollup for an entity and its descendants
 */
function computeEntityRollup(
  entityId: string,
  entityType: 'site' | 'building',
  allFindings: Finding[],
  buildings: EstateBuilding[],
  documentState?: any
): HealthRollup {
  // Collect all relevant IDs for this entity hierarchy
  const relevantIds = new Set<string>([entityId]);

  if (entityType === 'site') {
    // Include all buildings under this site
    buildings
      .filter((b) => b.siteId === entityId)
      .forEach((b) => relevantIds.add(b.id));

    // Also check document locations and devices if available
    if (documentState) {
      documentState.locations
        ?.filter((l: any) => l.siteId === entityId)
        .forEach((l: any) => relevantIds.add(l.id));
      documentState.devices
        ?.filter((d: any) => d.siteId === entityId)
        .forEach((d: any) => relevantIds.add(d.id));
    }
  } else if (entityType === 'building') {
    // Include rooms/locations nested under this building
    if (documentState) {
      documentState.locations
        ?.filter((l: any) => l.parentId === entityId || l.id === entityId)
        .forEach((l: any) => relevantIds.add(l.id));
      documentState.devices
        ?.filter((d: any) => d.locationId === entityId)
        .forEach((d: any) => relevantIds.add(d.id));
    }
  }

  // Filter findings
  const matchingFindings = allFindings.filter((f) => {
    const norm = normalizeEntityRef(f.entityRef);
    if (!norm) return false;
    return relevantIds.has(norm.id);
  });

  const hasBlocker = matchingFindings.some((f) => f.severity === 'blocker');
  const hasRisk = matchingFindings.some((f) => f.severity === 'risk');

  // Check for SLA breach or risk in findings
  const hasSlaBreach = matchingFindings.some(
    (f) =>
      f.rule.toUpperCase().includes('SLA_BREACH') ||
      f.message.toUpperCase().includes('SLA BREACH') ||
      (f.rule.toUpperCase().includes('SLA') && f.severity === 'blocker')
  );
  const hasSlaRisk = matchingFindings.some(
    (f) =>
      f.rule.toUpperCase().includes('SLA') &&
      f.severity === 'risk'
  );

  let status: 'critical' | 'warning' | 'healthy' = 'healthy';
  let highestSeverity: FindingSeverity | 'none' = 'none';

  if (hasBlocker || hasSlaBreach) {
    status = 'critical';
    highestSeverity = 'blocker';
  } else if (hasRisk || hasSlaRisk) {
    status = 'warning';
    highestSeverity = 'risk';
  } else if (matchingFindings.length > 0) {
    status = 'healthy';
    highestSeverity = 'advice';
  }

  let slaStatus: 'breached' | 'at_risk' | 'healthy' = 'healthy';
  if (hasSlaBreach) {
    slaStatus = 'breached';
  } else if (hasSlaRisk) {
    slaStatus = 'at_risk';
  }

  return {
    status,
    highestSeverity,
    slaStatus,
    findings: matchingFindings,
  };
}

export const EstateMap: React.FC<EstateMapProps> = ({
  siteId,
  sites: propSites,
  buildings: propBuildings,
  findings: propFindings,
  config: propConfig,
  onNavigate,
  onSelectEntity,
  className = '',
  style,
}) => {
  const { t } = useTranslation();
  const document = useDocumentStore((state) => state.document);
  const { findings: hookFindings } = useFindings();
  const allFindings = propFindings ?? hookFindings;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapMounted, setMapMounted] = useState<boolean>(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Default config without hardcoding external secrets (HS-15)
  const effectiveConfig: EstateMapConfig = useMemo(() => {
    return {
      styleUrl:
        propConfig?.styleUrl ||
        (typeof window !== 'undefined' && (window as any).__COPPER_CONFIG__?.mapStyleUrl) ||
        'https://tiles.copper.internal/styles/default.json',
      apiKey:
        propConfig?.apiKey ||
        (typeof window !== 'undefined' && (window as any).__COPPER_CONFIG__?.mapApiKey) ||
        undefined,
      tileProvider: propConfig?.tileProvider || 'osm',
    };
  }, [propConfig]);

  // Derive sites from props or documentStore
  const sites = useMemo<EstateSite[]>(() => {
    if (propSites) return propSites;
    if (!document?.sites) return [];

    return document.sites.map((s, idx) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      // Deterministic layout if no coordinates in schema
      coordinates: [10.75 + idx * 0.05, 59.91 + idx * 0.03],
    }));
  }, [propSites, document?.sites]);

  // Derive buildings from props or documentStore
  const buildings = useMemo<EstateBuilding[]>(() => {
    if (propBuildings) return propBuildings;
    if (!document?.locations) return [];

    // Root locations under a site act as buildings
    return document.locations
      .filter((loc) => !loc.parentId)
      .map((b, idx) => ({
        id: b.id,
        siteId: b.siteId,
        name: b.name,
        slug: b.slug,
        description: b.description,
        coordinates: [10.752 + idx * 0.01, 59.914 + idx * 0.01],
      }));
  }, [propBuildings, document?.locations]);

  // Filter if siteId is specified
  const displayedSites = useMemo(() => {
    if (!siteId) return sites;
    const match = sites.filter((s) => s.id === siteId);
    return match.length > 0 ? match : sites;
  }, [sites, siteId]);

  const displayedBuildings = useMemo(() => {
    if (!siteId) return buildings;
    return buildings.filter((b) => b.siteId === siteId);
  }, [buildings, siteId]);

  // Initialize MapLibre GL JS if available in runtime environment
  useEffect(() => {
    let mapInstance: any = null;
    const mapLibreGlobal = typeof window !== 'undefined' ? (window as any).maplibregl : null;

    if (containerRef.current && mapLibreGlobal && typeof mapLibreGlobal.Map === 'function') {
      try {
        mapInstance = new mapLibreGlobal.Map({
          container: containerRef.current,
          style: effectiveConfig.styleUrl,
          center: [10.7522, 59.9139],
          zoom: 12,
        });
      } catch {
        // Degrade gracefully in environments without WebGL
      }
    }

    setMapMounted(true);

    return () => {
      if (mapInstance && typeof mapInstance.remove === 'function') {
        mapInstance.remove();
      }
    };
  }, [effectiveConfig.styleUrl]);

  const handleEntityClick = useCallback(
    (entity: { id: string; type: 'site' | 'building'; name: string }) => {
      setSelectedEntityId(entity.id);
      if (onSelectEntity) {
        onSelectEntity(entity);
      }
      const targetPath = `/e/FUNCTIONAL_LOCATION/${encodeURIComponent(entity.id)}`;
      if (onNavigate) {
        onNavigate(targetPath, entity);
      } else if (typeof window !== 'undefined' && window.location) {
        window.history?.pushState?.(null, '', targetPath);
      }
    },
    [onNavigate, onSelectEntity]
  );

  // SVG coordinate projection helper for polygon visualization
  const projectCoordinates = useCallback(
    (coords: CoordinateTuple[]): string => {
      if (!coords || coords.length === 0) return '';
      // Approximate flat local projection to SVG coordinates (0-100% viewport)
      const minLng = 10.745;
      const maxLng = 10.76;
      const minLat = 59.91;
      const maxLat = 59.92;

      return coords
        .map(([lng, lat]) => {
          const x = ((lng - minLng) / (maxLng - minLng)) * 100;
          const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
    },
    []
  );

  return (
    <div
      data-testid="estate-map"
      className={`copper-estate-map flex flex-col w-full h-full relative ${className}`.trim()}
      style={{
        minHeight: '480px',
        backgroundColor: 'var(--md-sys-color-surface, #FEF7FF)',
        color: 'var(--md-sys-color-on-surface, #1D1B20)',
        ...style,
      }}
    >
      {/* 1. Estate Map Header & Controls */}
      <header
        data-testid="estate-map-header"
        className="flex items-center justify-between p-3 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)] bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] z-10"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
            {t('spatial.estateMap', 'Estate Map')}
          </span>
          <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
            <span className="px-2 py-0.5 rounded bg-[var(--md-sys-color-surface-container,#ECE6F0)] font-semibold">
              {displayedSites.length} {t('spatial.sites', 'Sites')}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--md-sys-color-surface-container,#ECE6F0)] font-semibold">
              {displayedBuildings.length} {t('spatial.buildings', 'Buildings')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {effectiveConfig.tileProvider && (
            <span
              data-testid="map-tile-provider"
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]"
            >
              {effectiveConfig.tileProvider.toUpperCase()}
            </span>
          )}
        </div>
      </header>

      {/* 2. MapLibre GL Map Viewport Container */}
      <div
        ref={containerRef}
        data-testid="maplibre-container"
        data-mounted={mapMounted ? 'true' : 'false'}
        data-style-url={effectiveConfig.styleUrl}
        data-provider={effectiveConfig.tileProvider}
        className="copper-maplibre-container relative flex-1 w-full h-full overflow-hidden"
        style={{ minHeight: '420px', position: 'relative' }}
      >
        {/* Polygon GeoJSON SVG Layer */}
        <svg
          data-testid="map-polygon-layer"
          className="copper-map-polygon-layer absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {displayedSites.map((site) => {
            if (!site.polygon || site.polygon.length === 0) return null;
            const points = projectCoordinates(site.polygon);
            const rollup = computeEntityRollup(site.id, 'site', allFindings, buildings, document);
            const strokeColor =
              rollup.status === 'critical'
                ? 'var(--copper-error, #BA1A1A)'
                : rollup.status === 'warning'
                ? 'var(--copper-semantic-risk, #B05500)'
                : 'var(--copper-primary, #B87333)';

            return (
              <polygon
                key={`poly-${site.id}`}
                data-testid={`map-polygon-${site.id}`}
                data-polygon-type="site"
                data-polygon-id={site.id}
                points={points}
                fill={strokeColor}
                fillOpacity="0.12"
                stroke={strokeColor}
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
            );
          })}

          {displayedBuildings.map((bldg) => {
            if (!bldg.polygon || bldg.polygon.length === 0) return null;
            const points = projectCoordinates(bldg.polygon);
            const rollup = computeEntityRollup(bldg.id, 'building', allFindings, buildings, document);
            const strokeColor =
              rollup.status === 'critical'
                ? 'var(--copper-error, #BA1A1A)'
                : rollup.status === 'warning'
                ? 'var(--copper-semantic-risk, #B05500)'
                : 'var(--copper-secondary, #3A6E6A)';

            return (
              <polygon
                key={`poly-${bldg.id}`}
                data-testid={`map-polygon-${bldg.id}`}
                data-polygon-type="building"
                data-polygon-id={bldg.id}
                points={points}
                fill={strokeColor}
                fillOpacity="0.22"
                stroke={strokeColor}
                strokeWidth="0.6"
              />
            );
          })}
        </svg>

        {/* Marker Interactive Layer */}
        <div
          data-testid="map-markers-layer"
          className="copper-map-markers-layer absolute inset-0 w-full h-full p-6 flex flex-wrap gap-4 items-start content-start pointer-events-auto z-20"
        >
          {/* Site Markers */}
          {displayedSites.map((site) => {
            const rollup = computeEntityRollup(site.id, 'site', allFindings, buildings, document);
            const isSelected = selectedEntityId === site.id;

            return (
              <div
                key={site.id}
                data-testid={`map-marker-${site.id}`}
                data-entity-type="site"
                data-entity-id={site.id}
                data-health={rollup.status}
                data-severity={rollup.highestSeverity}
                data-sla-status={rollup.slaStatus}
                data-findings-count={rollup.findings.length}
                role="button"
                tabIndex={0}
                onClick={() => handleEntityClick({ id: site.id, type: 'site', name: site.name })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEntityClick({ id: site.id, type: 'site', name: site.name });
                  }
                }}
                className={`copper-map-marker copper-marker-site flex items-center gap-2 p-2.5 rounded-xl border shadow-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-[var(--copper-primary,#B87333)]'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor:
                    rollup.status === 'critical'
                      ? 'var(--copper-error-container, #FFDAD6)'
                      : rollup.status === 'warning'
                      ? 'var(--copper-surface-container-high, #ECE6F0)'
                      : 'var(--md-sys-color-surface-container-lowest, #FFFFFF)',
                  borderColor:
                    rollup.status === 'critical'
                      ? 'var(--copper-error, #BA1A1A)'
                      : rollup.status === 'warning'
                      ? 'var(--copper-semantic-risk, #B05500)'
                      : 'var(--copper-primary, #B87333)',
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase font-bold text-[var(--copper-primary,#B87333)]">
                      {t('spatial.site', 'Site')}
                    </span>
                    <span
                      data-testid={`marker-health-badge-${site.id}`}
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor:
                          rollup.status === 'critical'
                            ? 'var(--copper-error, #BA1A1A)'
                            : rollup.status === 'warning'
                            ? 'var(--copper-semantic-risk, #B05500)'
                            : 'var(--copper-secondary, #3A6E6A)',
                        color: 'var(--copper-on-primary, #FFFFFF)',
                      }}
                    >
                      {rollup.status}
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface,#1D1B20)]">
                    {site.name}
                  </span>
                </div>

                {rollup.findings.length > 0 && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        rollup.status === 'critical'
                          ? 'var(--copper-error, #BA1A1A)'
                          : 'var(--copper-semantic-risk, #B05500)',
                      color: 'var(--copper-on-primary, #FFFFFF)',
                    }}
                  >
                    {rollup.findings.length}
                  </span>
                )}
              </div>
            );
          })}

          {/* Building Markers */}
          {displayedBuildings.map((bldg) => {
            const rollup = computeEntityRollup(bldg.id, 'building', allFindings, buildings, document);
            const isSelected = selectedEntityId === bldg.id;

            return (
              <div
                key={bldg.id}
                data-testid={`map-marker-${bldg.id}`}
                data-entity-type="building"
                data-entity-id={bldg.id}
                data-health={rollup.status}
                data-severity={rollup.highestSeverity}
                data-sla-status={rollup.slaStatus}
                data-findings-count={rollup.findings.length}
                role="button"
                tabIndex={0}
                onClick={() => handleEntityClick({ id: bldg.id, type: 'building', name: bldg.name })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEntityClick({ id: bldg.id, type: 'building', name: bldg.name });
                  }
                }}
                className={`copper-map-marker copper-marker-building flex items-center gap-2 p-2.5 rounded-xl border shadow-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-[var(--copper-secondary,#3A6E6A)]'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor:
                    rollup.status === 'critical'
                      ? 'var(--copper-error-container, #FFDAD6)'
                      : rollup.status === 'warning'
                      ? 'var(--copper-surface-container-high, #ECE6F0)'
                      : 'var(--md-sys-color-surface-container-lowest, #FFFFFF)',
                  borderColor:
                    rollup.status === 'critical'
                      ? 'var(--copper-error, #BA1A1A)'
                      : rollup.status === 'warning'
                      ? 'var(--copper-semantic-risk, #B05500)'
                      : 'var(--copper-secondary, #3A6E6A)',
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase font-bold text-[var(--copper-secondary,#3A6E6A)]">
                      {t('spatial.building', 'Building')}
                    </span>
                    <span
                      data-testid={`marker-health-badge-${bldg.id}`}
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor:
                          rollup.status === 'critical'
                            ? 'var(--copper-error, #BA1A1A)'
                            : rollup.status === 'warning'
                            ? 'var(--copper-semantic-risk, #B05500)'
                            : 'var(--copper-secondary, #3A6E6A)',
                        color: 'var(--copper-on-primary, #FFFFFF)',
                      }}
                    >
                      {rollup.status}
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface,#1D1B20)]">
                    {bldg.name}
                  </span>
                </div>

                {rollup.findings.length > 0 && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        rollup.status === 'critical'
                          ? 'var(--copper-error, #BA1A1A)'
                          : 'var(--copper-semantic-risk, #B05500)',
                      color: 'var(--copper-on-primary, #FFFFFF)',
                    }}
                  >
                    {rollup.findings.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
