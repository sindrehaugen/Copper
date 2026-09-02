import { useMemo } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { validateDocument, ValidationFinding } from './registry';

export type EnhancedFinding = ValidationFinding & { fix?: () => void };

export function useDocumentFindings(): EnhancedFinding[] {
  const document = useDocumentStore((state: any) => state.document);
  const remoteFindings = useDocumentStore((state: any) => state.remoteFindings || []);
  const setSelectedIds = useDocumentStore((state: any) => state.setSelectedIds);

  return useMemo(() => {
    if (!document) return [];
    const result = validateDocument(document);
    
    const local = result.findings.map(f => {
      const enhanced: EnhancedFinding = { ...f };
      if (f.targetId) {
        enhanced.fix = () => setSelectedIds([f.targetId!]);
      }
      return enhanced;
    });

    const remote = remoteFindings.map((f: any) => {
      const enhanced: EnhancedFinding = { ...f };
      if (f.targetId) {
        enhanced.fix = () => setSelectedIds([f.targetId!]);
      }
      return enhanced;
    });

    return [...local, ...remote];
  }, [document, remoteFindings, setSelectedIds]);
}
