import type { Facet, Capability } from "./types";
import { hasCapability } from "./capability";

export class FacetRegistry {
  private facets = new Map<string, Facet<unknown>>();

  register<TData = unknown>(facet: Facet<TData>): () => void {
    this.facets.set(facet.id, facet as Facet<unknown>);
    return () => {
      this.unregister(facet.id);
    };
  }

  unregister(facetId: string): boolean {
    return this.facets.delete(facetId);
  }

  getFacet(facetId: string): Facet<unknown> | undefined {
    return this.facets.get(facetId);
  }

  getAllFacets(): Facet<unknown>[] {
    return Array.from(this.facets.values()).sort((a, b) => a.weight - b.weight);
  }

  getFacetsForEntity(
    entityType: string,
    userCapabilities?: Capability[] | null
  ): Facet<unknown>[] {
    const all = Array.from(this.facets.values());
    const matched = all.filter((facet) => {
      // 1. Entity type match
      const entityMatches =
        facet.entity.includes("*") ||
        facet.entity.includes(entityType) ||
        facet.entity.some((e) => e.toUpperCase() === entityType.toUpperCase());

      if (!entityMatches) return false;

      // 2. Capability gate: if requires is specified, check against userCapabilities
      if (userCapabilities !== undefined && !hasCapability(facet.requires, userCapabilities)) {
        return false;
      }

      return true;
    });

    return matched.sort((a, b) => a.weight - b.weight);
  }

  clear(): void {
    this.facets.clear();
  }
}

export const facetRegistry = new FacetRegistry();

export function registerFacet<TData = unknown>(facet: Facet<TData>): () => void {
  return facetRegistry.register(facet);
}

export function unregisterFacet(facetId: string): boolean {
  return facetRegistry.unregister(facetId);
}

export function getFacetsForEntity(
  entityType: string,
  userCapabilities?: Capability[] | null
): Facet<unknown>[] {
  return facetRegistry.getFacetsForEntity(entityType, userCapabilities);
}

export function clearFacetRegistry(): void {
  facetRegistry.clear();
}
