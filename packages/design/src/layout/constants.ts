/**
 * Layout Constants — Shell Three Zones (Batch 130 / SH.W2)
 */

import { ContextGroup, IntelligenceSectionKind, ShellShortcut } from './types';

export const CONTEXT_GROUPS: readonly ContextGroup[] = [
  {
    id: 'now',
    labelKey: 'nav.now',
    defaultRoute: '/now',
    icon: '◆',
    shortcutKey: '1',
    descriptionKey: 'nav.nowDesc',
  },
  {
    id: 'rooms',
    labelKey: 'nav.rooms',
    defaultRoute: '/rooms',
    icon: '◫',
    shortcutKey: '2',
    descriptionKey: 'nav.roomsDesc',
  },
  {
    id: 'design',
    labelKey: 'nav.design',
    defaultRoute: '/design',
    icon: '📐',
    shortcutKey: '3',
    descriptionKey: 'nav.designDesc',
  },
  {
    id: 'commerce',
    labelKey: 'nav.commerce',
    defaultRoute: '/commerce',
    icon: '◈',
    shortcutKey: '4',
    descriptionKey: 'nav.commerceDesc',
  },
  {
    id: 'supply',
    labelKey: 'nav.supply',
    defaultRoute: '/supply',
    icon: '📦',
    shortcutKey: '5',
    descriptionKey: 'nav.supplyDesc',
  },
  {
    id: 'service',
    labelKey: 'nav.service',
    defaultRoute: '/service',
    icon: '⚙',
    shortcutKey: '6',
    descriptionKey: 'nav.serviceDesc',
  },
  {
    id: 'insight',
    labelKey: 'nav.insight',
    defaultRoute: '/insight',
    icon: '📈',
    shortcutKey: '7',
    descriptionKey: 'nav.insightDesc',
  },
  {
    id: 'ops',
    labelKey: 'nav.ops',
    defaultRoute: '/ops',
    icon: '🛡',
    shortcutKey: '8',
    descriptionKey: 'nav.opsDesc',
  },
] as const;

export const CONTRACT_R_BUDGET = {
  maxSections: 5,
  maxItemsPerSection: 3,
} as const;

export const LAYOUT_DIMENSIONS = {
  globalBarHeight: '48px',
  contextRailWidthExpanded: '220px',
  contextRailWidthCollapsed: '56px',
  intelligenceRailWidthExpanded: '300px',
  intelligenceRailWidthCollapsed: '40px',
  findingsTrayHeightOpen: '180px',
  findingsTrayHeightClosed: '36px',
} as const;

export const INTELLIGENCE_SECTIONS: readonly IntelligenceSectionKind[] = [
  'proposals',
  'findings',
  'related',
  'why',
  'anomalies',
] as const;

export const SHELL_SHORTCUTS: readonly ShellShortcut[] = [
  {
    key: 'k',
    metaKey: true,
    descriptionKey: 'nav.searchPlaceholder',
    actionId: 'command-palette',
  },
  {
    key: 'k',
    altKey: true,
    descriptionKey: 'nav.askAboutThis',
    actionId: 'ask-about-this',
  },
  {
    key: '`',
    ctrlKey: true,
    descriptionKey: 'nav.toggleFindings',
    actionId: 'toggle-findings',
  },
] as const;
