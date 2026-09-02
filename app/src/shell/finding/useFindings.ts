/**
 * Findings Hook (Batch 142 / OB.W4)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Finding, FindingFilter } from './types';
import { findingRegistry } from './registry';

export interface UseFindingsResult {
  findings: Finding[];
  count: number;
  blockers: Finding[];
  risks: Finding[];
  advice: Finding[];
  executeFix: (findingId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useFindings(filter?: FindingFilter): UseFindingsResult {
  const [allFindings, setAllFindings] = useState<Finding[]>(() =>
    findingRegistry.getAllFindings()
  );

  useEffect(() => {
    setAllFindings(findingRegistry.getAllFindings());

    const unsubscribe = findingRegistry.subscribe(updated => {
      setAllFindings(updated);
    });

    return unsubscribe;
  }, []);

  const filteredFindings = useMemo(() => {
    return findingRegistry.filterFindings(allFindings, filter);
  }, [allFindings, filter]);

  const blockers = useMemo(
    () => filteredFindings.filter(f => f.severity === 'blocker'),
    [filteredFindings]
  );
  const risks = useMemo(
    () => filteredFindings.filter(f => f.severity === 'risk'),
    [filteredFindings]
  );
  const advice = useMemo(
    () => filteredFindings.filter(f => f.severity === 'advice'),
    [filteredFindings]
  );

  const executeFix = useCallback(async (findingId: string) => {
    return findingRegistry.executeFix(findingId);
  }, []);

  const refresh = useCallback(() => {
    setAllFindings(findingRegistry.getAllFindings());
  }, []);

  return {
    findings: filteredFindings,
    count: filteredFindings.length,
    blockers,
    risks,
    advice,
    executeFix,
    refresh,
  };
}
