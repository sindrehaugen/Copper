import React, { useMemo } from "react";
import type { FacetContainerProps } from "./types";
import { getFacetsForEntity } from "./registry";
import { FacetCard } from "./FacetCard";
import { useSessionStore } from "../../store/sessionStore";

export function FacetContainer({
  entityType,
  entityId,
  capabilities,
  className = "",
}: FacetContainerProps) {
  const storeCapabilities = useSessionStore((s) => (s as unknown as { capabilities?: string[] }).capabilities);
  const effectiveCapabilities = capabilities !== undefined ? capabilities : storeCapabilities;

  const applicableFacets = useMemo(() => {
    return getFacetsForEntity(entityType, effectiveCapabilities);
  }, [entityType, effectiveCapabilities]);

  if (applicableFacets.length === 0) {
    return null;
  }

  return (
    <div
      className={`copper-facet-container flex flex-col gap-4 ${className}`.trim()}
      data-testid="facet-container"
      data-entity-type={entityType}
      data-entity-id={entityId}
    >
      {applicableFacets.map((facet) => (
        <FacetCard
          key={facet.id}
          facet={facet}
          entityType={entityType}
          entityId={entityId}
        />
      ))}
    </div>
  );
}
