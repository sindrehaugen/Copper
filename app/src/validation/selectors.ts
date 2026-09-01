import { useMemo } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { validateDocument, ValidationFinding } from './registry';

export type EnhancedFinding = ValidationFinding & { fix?: () => void };

export function useDocumentFindings(): EnhancedFinding[] {
  const document = useDocumentStore((state: any) => state.document);
  const remoteFindings = useDocumentStore((state: any) => state.remoteFindings || []);

  return useMemo(() => {
    if (!document) return [];
    const result = validateDocument(document);
    
    const local = result.findings.map(f => {
      const enhanced: EnhancedFinding = { ...f };
      if (f.source === 'AudioLine' && f.targetId) {
        // stub
      }
      return enhanced;
    });

    return [...local, ...remoteFindings];
  }, [document, remoteFindings]);
}
