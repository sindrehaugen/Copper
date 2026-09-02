import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DesignDocument, Location, Site } from '../../model/schema';
import { useFindings, Finding, normalizeEntityRef } from '../../shell/finding';

export type FunctionalLocationLevel = 'site' | 'building' | 'floor' | 'room' | 'position' | 'location';

export interface LocationTreeNode {
  id: string;
  name: string;
  slug?: string;
  type: FunctionalLocationLevel;
  level: number;
  parentId?: string;
  siteId?: string;
  description?: string;
  children: LocationTreeNode[];
  deviceCount: number;
  rackCount: number;
  totalEntityCount: number;
}

export interface LocationTreeProps {
  document?: DesignDocument | null;
  namespaceId?: string;
  fetchUrl?: string;
  initialExpanded?: 'all' | 'none' | string[];
  selectedId?: string;
  onSelectNode?: (node: LocationTreeNode) => void;
  onNavigate?: (path: string) => void;
  findings?: Finding[];
  className?: string;
  style?: React.CSSProperties;
}

function resolveLevelName(level: number): FunctionalLocationLevel {
  switch (level) {
    case 0:
      return 'site';
    case 1:
      return 'building';
    case 2:
      return 'floor';
    case 3:
      return 'room';
    case 4:
      return 'position';
    default:
      return 'location';
  }
}

export const LocationTree: React.FC<LocationTreeProps> = ({
  document: propDoc,
  namespaceId,
  fetchUrl,
  initialExpanded = 'all',
  selectedId: propSelectedId,
  onSelectNode,
  onNavigate,
  findings: propFindings,
  className = '',
  style,
}) => {
  const { t } = useTranslation();
  const [doc, setDoc] = useState<DesignDocument | null>(propDoc || null);
  const [loading, setLoading] = useState<boolean>(!propDoc);
  const [error, setError] = useState<string | null>(null);

  const { findings: hookFindings } = useFindings();
  const allFindings = propFindings ?? hookFindings;

  // Fetch topology if no document was passed
  useEffect(() => {
    if (propDoc) {
      setDoc(propDoc);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const endpoint =
      fetchUrl ||
      `/api/system-design/topology${namespaceId ? `?namespace_id=${encodeURIComponent(namespaceId)}` : ''}`;

    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch topology: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.sites || data.locations) {
          setDoc(data);
        } else if (data.functional_locations) {
          const rawFL: Array<any> = data.functional_locations;
          const sites = rawFL.filter((fl) => !fl.siteId);
          const locations = rawFL.filter((fl) => !!fl.siteId);
          const devices = (data.devices || []).map((d: any) => ('node' in d ? d.node : d));
          const racks = (data.racks || []).map((r: any) => ('node' in r ? r.node : r));

          setDoc({
            schemaVersion: 1,
            designLabel: data.design?.designLabel || 'Topology',
            sites,
            locations,
            devices,
            racks,
            cables: data.cables || [],
            signalClasses: data.design?.signalClasses || [],
            deviceTypes: data.design?.deviceTypes || [],
          } as unknown as DesignDocument);
        } else {
          setDoc(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('LocationTree fetch error:', err);
        setError(err.message || 'Error fetching topology');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propDoc, namespaceId, fetchUrl]);

  // Build tree nodes and counts
  const treeRoots = useMemo<LocationTreeNode[]>(() => {
    if (!doc) return [];

    const { sites = [], locations = [], devices = [], racks = [] } = doc;

    const deviceCountByLoc = new Map<string, number>();
    const rackCountByLoc = new Map<string, number>();

    for (const d of devices) {
      const locId = d.locationId || d.siteId;
      if (locId) {
        deviceCountByLoc.set(locId, (deviceCountByLoc.get(locId) || 0) + 1);
      }
    }

    for (const r of racks) {
      const locId = r.locationId || r.siteId;
      if (locId) {
        rackCountByLoc.set(locId, (rackCountByLoc.get(locId) || 0) + 1);
      }
    }

    function buildLocationNode(loc: Location, level: number): LocationTreeNode {
      const childLocations = locations.filter((l) => l.parentId === loc.id);
      const childNodes = childLocations.map((child) => buildLocationNode(child, level + 1));

      const directDevs = deviceCountByLoc.get(loc.id) || 0;
      const directRacks = rackCountByLoc.get(loc.id) || 0;

      const totalDevs = directDevs + childNodes.reduce((acc, c) => acc + c.deviceCount, 0);
      const totalRacks = directRacks + childNodes.reduce((acc, c) => acc + c.rackCount, 0);

      return {
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
        type: resolveLevelName(level),
        level,
        parentId: loc.parentId,
        siteId: loc.siteId,
        description: loc.description,
        children: childNodes,
        deviceCount: totalDevs,
        rackCount: totalRacks,
        totalEntityCount: directDevs + directRacks,
      };
    }

    return sites.map((site: Site) => {
      const rootLocations = locations.filter((loc) => loc.siteId === site.id && !loc.parentId);
      const childNodes = rootLocations.map((loc) => buildLocationNode(loc, 1));

      const directDevs = deviceCountByLoc.get(site.id) || 0;
      const directRacks = rackCountByLoc.get(site.id) || 0;

      const totalDevs = directDevs + childNodes.reduce((acc, c) => acc + c.deviceCount, 0);
      const totalRacks = directRacks + childNodes.reduce((acc, c) => acc + c.rackCount, 0);

      return {
        id: site.id,
        name: site.name,
        slug: site.slug,
        type: 'site',
        level: 0,
        description: site.description,
        children: childNodes,
        deviceCount: totalDevs,
        rackCount: totalRacks,
        totalEntityCount: directDevs + directRacks,
      };
    });
  }, [doc]);

  // Initial expanded state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    function collectIds(nodes: LocationTreeNode[]) {
      for (const n of nodes) {
        if (n.children.length > 0) {
          set.add(n.id);
          collectIds(n.children);
        }
      }
    }
    if (initialExpanded === 'all') {
      collectIds(treeRoots);
    } else if (Array.isArray(initialExpanded)) {
      for (const id of initialExpanded) set.add(id);
    }
    return set;
  });

  // Keep expanded state updated if roots change
  useEffect(() => {
    if (initialExpanded === 'all') {
      const set = new Set<string>();
      function collectIds(nodes: LocationTreeNode[]) {
        for (const n of nodes) {
          if (n.children.length > 0) {
            set.add(n.id);
            collectIds(n.children);
          }
        }
      }
      collectIds(treeRoots);
      setExpandedIds(set);
    }
  }, [treeRoots, initialExpanded]);

  const [selectedId, setSelectedId] = useState<string | undefined>(propSelectedId);
  const [focusedId, setFocusedId] = useState<string | undefined>(() => treeRoots[0]?.id);

  useEffect(() => {
    if (propSelectedId !== undefined) {
      setSelectedId(propSelectedId);
    }
  }, [propSelectedId]);

  useEffect(() => {
    if (!focusedId && treeRoots.length > 0) {
      setFocusedId(treeRoots[0].id);
    }
  }, [treeRoots, focusedId]);

  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Flattened visible nodes for keyboard navigation
  const visibleNodes = useMemo<LocationTreeNode[]>(() => {
    const list: LocationTreeNode[] = [];
    function traverse(nodes: LocationTreeNode[]) {
      for (const node of nodes) {
        list.push(node);
        if (node.children.length > 0 && expandedIds.has(node.id)) {
          traverse(node.children);
        }
      }
    }
    traverse(treeRoots);
    return list;
  }, [treeRoots, expandedIds]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleNavigateToNode = useCallback(
    (node: LocationTreeNode) => {
      setSelectedId(node.id);
      if (onSelectNode) {
        onSelectNode(node);
      }
      const targetPath = `/e/FUNCTIONAL_LOCATION/${encodeURIComponent(node.id)}`;
      if (onNavigate) {
        onNavigate(targetPath);
      } else if (typeof window !== 'undefined' && window.location) {
        // Default navigation fallback
        window.history?.pushState?.(null, '', targetPath);
      }
    },
    [onSelectNode, onNavigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, node: LocationTreeNode) => {
      e.stopPropagation();
      const currentIndex = visibleNodes.findIndex((n) => n.id === node.id);
      if (currentIndex === -1) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < visibleNodes.length - 1) {
            const nextNode = visibleNodes[currentIndex + 1];
            setFocusedId(nextNode.id);
            nodeRefs.current.get(nextNode.id)?.focus();
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevNode = visibleNodes[currentIndex - 1];
            setFocusedId(prevNode.id);
            nodeRefs.current.get(prevNode.id)?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (node.children.length > 0) {
            if (!expandedIds.has(node.id)) {
              setExpandedIds((prev) => new Set(prev).add(node.id));
            } else {
              const firstChild = node.children[0];
              if (firstChild) {
                setFocusedId(firstChild.id);
                nodeRefs.current.get(firstChild.id)?.focus();
              }
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (node.children.length > 0 && expandedIds.has(node.id)) {
            setExpandedIds((prev) => {
              const next = new Set(prev);
              next.delete(node.id);
              return next;
            });
          } else if (node.parentId || node.siteId) {
            const parentTargetId = node.parentId || node.siteId;
            if (parentTargetId) {
              const parentNode = visibleNodes.find((n) => n.id === parentTargetId);
              if (parentNode) {
                setFocusedId(parentNode.id);
                nodeRefs.current.get(parentNode.id)?.focus();
              }
            }
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          handleNavigateToNode(node);
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            const first = visibleNodes[0];
            setFocusedId(first.id);
            nodeRefs.current.get(first.id)?.focus();
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            const last = visibleNodes[visibleNodes.length - 1];
            setFocusedId(last.id);
            nodeRefs.current.get(last.id)?.focus();
          }
          break;
        }
        default:
          break;
      }
    },
    [visibleNodes, expandedIds, handleNavigateToNode]
  );

  // Helper to find findings for a node
  const getFindingsForNode = useCallback(
    (nodeId: string) => {
      return allFindings.filter((f) => {
        const norm = normalizeEntityRef(f.entityRef);
        if (!norm) return false;
        return norm.id === nodeId;
      });
    },
    [allFindings]
  );

  if (loading) {
    return (
      <div data-testid="location-tree-loading" className="copper-location-tree-loading">
        {t('common.loading', 'Loading functional locations...')}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="location-tree-error" className="copper-location-tree-error">
        {error}
      </div>
    );
  }

  const renderNode = (node: LocationTreeNode, isRootSite = false) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const isFocused = focusedId === node.id;

    const nodeFindings = getFindingsForNode(node.id);
    const hasBlocker = nodeFindings.some((f) => f.severity === 'blocker');
    const hasRisk = nodeFindings.some((f) => f.severity === 'risk');
    const badgeSeverity = hasBlocker ? 'blocker' : hasRisk ? 'risk' : 'advice';

    const testId = isRootSite ? `site-${node.id}` : `location-${node.id}`;
    const childrenContainerTestId = isRootSite
      ? `site-locations-${node.id}`
      : `location-children-${node.id}`;

    return (
      <li
        key={node.id}
        ref={(el) => {
          if (el) nodeRefs.current.set(node.id, el);
          else nodeRefs.current.delete(node.id);
        }}
        id={`fl-tree-node-${node.id}`}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={node.level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-testid={testId}
        data-node-type={node.type}
        data-level={node.level}
        className={`copper-tree-node copper-tree-node--${node.type} ${
          isSelected ? 'copper-tree-node--selected' : ''
        } ${isFocused ? 'copper-tree-node--focused' : ''}`}
        onKeyDown={(e) => handleKeyDown(e, node)}
        onFocus={(e) => {
          e.stopPropagation();
          setFocusedId(node.id);
        }}
        style={{
          listStyleType: 'none',
          padding: '2px 0',
          outline: 'none',
        }}
      >
        <div
          className="copper-tree-node-content"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: isSelected
              ? 'var(--md-sys-color-secondary-container)'
              : 'transparent',
            cursor: 'pointer',
          }}
        >
          {/* Expand / collapse icon toggle */}
          {hasChildren ? (
            <button
              type="button"
              className="copper-tree-expander"
              data-testid={`expander-${node.id}`}
              aria-label={isExpanded ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '11px',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span style={{ display: 'inline-block', width: '16px' }} />
          )}

          {/* Node Navigation Link */}
          <a
            href={`/e/FUNCTIONAL_LOCATION/${encodeURIComponent(node.id)}`}
            data-testid={`node-link-${node.id}`}
            className="copper-tree-node-label"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigateToNode(node);
            }}
            style={{
              textDecoration: 'none',
              color: 'var(--md-sys-color-on-surface)',
              fontWeight: isRootSite || node.type === 'building' ? 600 : 400,
              fontSize: '13px',
            }}
          >
            {node.name}
          </a>

          {/* Entity Count Badge */}
          {node.totalEntityCount > 0 && (
            <span
              className="copper-tree-entity-count"
              data-testid={`entity-count-${node.id}`}
              data-count={node.totalEntityCount}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--copper-font-mono, monospace)',
                color: 'var(--md-sys-color-on-surface-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                padding: '1px 5px',
                borderRadius: '10px',
              }}
            >
              {node.totalEntityCount}
            </span>
          )}

          {/* Finding Badge (OB.W4 / B142) */}
          {nodeFindings.length > 0 && (
            <span
              className={`copper-tree-finding-badge badge-${badgeSeverity}`}
              data-testid={`finding-badge-${node.id}`}
              data-findings-count={nodeFindings.length}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor:
                  badgeSeverity === 'blocker'
                    ? 'var(--md-sys-color-error)'
                    : badgeSeverity === 'risk'
                    ? 'var(--md-sys-color-tertiary)'
                    : 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary, var(--copper-on-primary, #ffffff))',
              }}
            >
              {nodeFindings.length}
            </span>
          )}
        </div>

        {/* Child nodes */}
        {hasChildren && isExpanded && (
          <ul
            data-testid={childrenContainerTestId}
            role="group"
            style={{
              paddingLeft: '20px',
              margin: '2px 0',
              listStyleType: 'none',
            }}
          >
            {node.children.map((child) => renderNode(child, false))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul
      role="tree"
      data-testid="location-tree"
      aria-label="Functional Location Hierarchy"
      className={`copper-location-tree ${className}`}
      style={{
        paddingLeft: '0',
        margin: '0',
        listStyleType: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {treeRoots.map((site) => renderNode(site, true))}
    </ul>
  );
};
