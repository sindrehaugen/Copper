/**
 * Cross-Engine Finding Registry (Batch 142 / OB.W4)
 */

import {
  Finding,
  FindingFilter,
  FindingProducer,
  FindingSeverity,
  EntityRefInput,
} from './types';

export function normalizeEntityRef(ref?: EntityRefInput): { type: string; id: string } | null {
  if (!ref) return null;
  if (typeof ref === 'object' && 'type' in ref && 'id' in ref) {
    return { type: ref.type, id: ref.id };
  }
  if (typeof ref === 'string') {
    const cleaned = ref.replace(/^\/e\//, '');
    const colonIdx = cleaned.indexOf(':');
    const slashIdx = cleaned.indexOf('/');
    const sepIdx = colonIdx !== -1 ? colonIdx : slashIdx;
    if (sepIdx !== -1) {
      return {
        type: cleaned.slice(0, sepIdx),
        id: cleaned.slice(sepIdx + 1),
      };
    }
    return { type: '', id: cleaned };
  }
  return null;
}

export function matchesEntity(findingRef?: EntityRefInput, filterType?: string, filterId?: string): boolean {
  if (!filterType && !filterId) return true;
  if (!findingRef) return false;

  const normalized = normalizeEntityRef(findingRef);
  if (!normalized) return false;

  if (filterType && filterId) {
    if (normalized.type && normalized.type === filterType && normalized.id === filterId) {
      return true;
    }
    if (!normalized.type && normalized.id === filterId) {
      return true;
    }
    return false;
  }

  if (filterType) {
    return normalized.type === filterType;
  }

  if (filterId) {
    return normalized.id === filterId;
  }

  return false;
}

export const SEVERITY_WEIGHT: Record<FindingSeverity, number> = {
  blocker: 1,
  risk: 2,
  advice: 3,
};

export class FindingRegistry {
  private producers: Map<string, FindingProducer> = new Map();
  private dynamicFindings: Map<string, Finding[]> = new Map();
  private subscribers: Set<(findings: Finding[]) => void> = new Set();

  public registerProducer(producer: FindingProducer): () => void {
    this.producers.set(producer.id, producer);
    if (producer.findings) {
      this.dynamicFindings.set(
        producer.id,
        producer.findings.map(f => ({ ...f, producerId: producer.id }))
      );
    }
    this.notify();

    return () => {
      this.unregisterProducer(producer.id);
    };
  }

  public unregisterProducer(producerId: string): void {
    this.producers.delete(producerId);
    this.dynamicFindings.delete(producerId);
    this.notify();
  }

  public setProducerFindings(producerId: string, findings: Finding[]): void {
    this.dynamicFindings.set(
      producerId,
      findings.map(f => ({ ...f, producerId }))
    );
    this.notify();
  }

  public clearProducerFindings(producerId: string): void {
    this.dynamicFindings.delete(producerId);
    this.notify();
  }

  public clearFinding(findingId: string): void {
    let changed = false;
    for (const [producerId, list] of this.dynamicFindings.entries()) {
      const filtered = list.filter(f => f.id !== findingId);
      if (filtered.length !== list.length) {
        this.dynamicFindings.set(producerId, filtered);
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
  }

  public getAllFindings(): Finding[] {
    const combined: Finding[] = [];
    for (const list of this.dynamicFindings.values()) {
      combined.push(...list);
    }

    return this.sortFindings(combined);
  }

  public sortFindings(findings: Finding[]): Finding[] {
    return [...findings].sort(
      (a, b) => (SEVERITY_WEIGHT[a.severity] ?? 99) - (SEVERITY_WEIGHT[b.severity] ?? 99)
    );
  }

  public filterFindings(findings: Finding[], filter?: FindingFilter): Finding[] {
    if (!filter) return this.sortFindings(findings);

    return this.sortFindings(
      findings.filter(f => {
        if (filter.rule && f.rule !== filter.rule) return false;
        if (filter.producerId && f.producerId !== filter.producerId) return false;
        if (filter.severity) {
          if (Array.isArray(filter.severity)) {
            if (!filter.severity.includes(f.severity)) return false;
          } else if (f.severity !== filter.severity) {
            return false;
          }
        }
        if (filter.entityType || filter.entityId) {
          if (!matchesEntity(f.entityRef, filter.entityType, filter.entityId)) {
            return false;
          }
        } else if (filter.entityRef) {
          const normFilter = normalizeEntityRef(filter.entityRef);
          if (normFilter && !matchesEntity(f.entityRef, normFilter.type, normFilter.id)) {
            return false;
          }
        }
        return true;
      })
    );
  }

  public getFilteredFindings(filter?: FindingFilter): Finding[] {
    return this.filterFindings(this.getAllFindings(), filter);
  }

  public async executeFix(findingId: string): Promise<boolean> {
    const finding = this.getAllFindings().find(f => f.id === findingId);
    if (!finding || !finding.fix) return false;

    await finding.fix.apply();
    this.clearFinding(findingId);
    return true;
  }

  public subscribe(callback: (findings: Finding[]) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    const all = this.getAllFindings();
    for (const sub of this.subscribers) {
      try {
        sub(all);
      } catch (err) {
        console.error('Error in finding listener subscriber:', err);
      }
    }
  }

  public clearAll(): void {
    this.producers.clear();
    this.dynamicFindings.clear();
    this.notify();
  }
}

export const findingRegistry = new FindingRegistry();
