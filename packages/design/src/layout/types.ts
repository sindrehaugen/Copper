/**
 * Layout Types — Shell Three Zones (Batch 130 / SH.W2)
 */

export type ContextGroupId =
  | 'now'
  | 'rooms'
  | 'design'
  | 'commerce'
  | 'supply'
  | 'service'
  | 'insight'
  | 'ops';

export interface ContextGroup {
  id: ContextGroupId;
  labelKey: string;
  defaultRoute: string;
  icon: string;
  shortcutKey: string;
  descriptionKey: string;
}

export type RailState = 'expanded' | 'collapsed' | 'hidden';

export type FindingSeverity = 'blocker' | 'risk' | 'advice';

export interface IntelligenceItem {
  id: string;
  sectionId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: FindingSeverity;
  provenanceRef?: string;
  actionLabel?: string;
  action?: () => void;
}

export type IntelligenceSectionKind =
  | 'proposals'
  | 'findings'
  | 'related'
  | 'why'
  | 'anomalies';

export interface IntelligenceSection {
  id: IntelligenceSectionKind;
  titleKey: string;
  count: number;
  items: IntelligenceItem[];
}

export interface ShellFinding {
  id: string;
  rule: string;
  severity: FindingSeverity;
  message: string;
  entityRef?: string;
  fixable?: boolean;
}

export interface ShellShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  descriptionKey: string;
  actionId: string;
}
