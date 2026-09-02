/**
 * Cross-Engine Finding Model & Types (Batch 142 / OB.W4)
 */

export type FindingSeverity = 'blocker' | 'risk' | 'advice';

export interface FixAction {
  id: string;
  label: string;
  description?: string;
  apply: () => void | Promise<void>;
  status?: 'idle' | 'pending' | 'applied' | 'failed';
  disabled?: boolean;
}

export interface EntityReference {
  type: string;
  id: string;
}

export type EntityRefInput = string | EntityReference;

export interface Finding<TEvidence = unknown> {
  id: string;
  severity: FindingSeverity;
  rule: string;
  message: string;
  entityRef?: EntityRefInput;
  evidence?: TEvidence;
  provenanceRef?: string;
  fix?: FixAction;
  producerId?: string;
  timestamp?: number | string;
}

export interface FindingFilter {
  entityType?: string;
  entityId?: string;
  entityRef?: EntityRefInput;
  severity?: FindingSeverity | FindingSeverity[];
  rule?: string;
  producerId?: string;
}

export type FindingProducerFn = (context?: {
  entityType?: string;
  entityId?: string;
}) => Finding[] | Promise<Finding[]>;

export interface FindingProducer {
  id: string;
  name?: string;
  produce?: FindingProducerFn;
  findings?: Finding[];
}

export interface FindingsTrayProps {
  findings?: Finding[];
  isOpen?: boolean;
  onToggle?: () => void;
  filter?: FindingFilter;
  showEntityFilter?: boolean;
  onFix?: (finding: Finding) => void | Promise<void>;
  className?: string;
}
