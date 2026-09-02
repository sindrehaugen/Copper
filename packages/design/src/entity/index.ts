/**
 * Entity Design Metadata Registry (Batch 139 / OB.W1 - Contract-G)
 * Maps each canonical entity type to human-readable label, icon, and M3/Copper tokens.
 */

export interface EntityDesignMetadata {
  label: string;
  icon: string;
  color?: string;
  bgVar: string;
  textVar: string;
  borderVar?: string;
}

export const ENTITY_METADATA: Record<string, EntityDesignMetadata> = {
  FUNCTIONAL_LOCATION: {
    label: "Location",
    icon: "🏢",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  ROOM: {
    label: "Room",
    icon: "🏢",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  ASSET: {
    label: "Asset",
    icon: "📦",
    bgVar: "var(--md-sys-color-primary-container)",
    textVar: "var(--md-sys-color-on-primary-container)",
    color: "var(--md-sys-color-primary)",
  },
  QUOTE: {
    label: "Quote",
    icon: "📄",
    bgVar: "var(--md-sys-color-tertiary-container)",
    textVar: "var(--md-sys-color-on-tertiary-container)",
    color: "var(--md-sys-color-tertiary)",
  },
  TICKET: {
    label: "Ticket",
    icon: "🎫",
    bgVar: "var(--copper-semantic-advice-container)",
    textVar: "var(--copper-semantic-on-advice-container)",
    color: "var(--copper-semantic-advice)",
  },
  CUSTOMER: {
    label: "Customer",
    icon: "👤",
    bgVar: "var(--md-sys-color-surface-variant)",
    textVar: "var(--md-sys-color-on-surface-variant)",
    color: "var(--md-sys-color-primary)",
  },
  LEAD: {
    label: "Lead",
    icon: "🎯",
    bgVar: "var(--md-sys-color-tertiary-container)",
    textVar: "var(--md-sys-color-on-tertiary-container)",
    color: "var(--md-sys-color-tertiary)",
  },
  OPPORTUNITY: {
    label: "Opportunity",
    icon: "💼",
    bgVar: "var(--md-sys-color-tertiary-container)",
    textVar: "var(--md-sys-color-on-tertiary-container)",
    color: "var(--md-sys-color-tertiary)",
  },
  DEAL: {
    label: "Deal",
    icon: "🤝",
    bgVar: "var(--md-sys-color-primary-container)",
    textVar: "var(--md-sys-color-on-primary-container)",
    color: "var(--md-sys-color-primary)",
  },
  SIGNED_BASELINE: {
    label: "Signed Baseline",
    icon: "🔒",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  PRODUCT: {
    label: "Product",
    icon: "🏷️",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-surface-tint)",
  },
  PRODUCT_SKU: {
    label: "Product SKU",
    icon: "🏷️",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-surface-tint)",
  },
  PO: {
    label: "Purchase Order",
    icon: "📑",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-surface-tint)",
  },
  PO_LINE: {
    label: "PO Line",
    icon: "📋",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-surface-tint)",
  },
  GOODS_RECEIPT: {
    label: "Goods Receipt",
    icon: "🚚",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--copper-semantic-advice)",
  },
  PROCUREMENT_MATCH: {
    label: "3-Way Match",
    icon: "⚖️",
    bgVar: "var(--copper-semantic-risk-container)",
    textVar: "var(--copper-semantic-on-risk-container)",
    color: "var(--copper-semantic-risk)",
  },
  VENDOR: {
    label: "Vendor",
    icon: "🤝",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-outline)",
  },
  CONTRACTOR: {
    label: "Contractor",
    icon: "👷",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-outline)",
  },
  CERT: {
    label: "Certification",
    icon: "🎖️",
    bgVar: "var(--copper-semantic-advice-container)",
    textVar: "var(--copper-semantic-on-advice-container)",
    color: "var(--copper-semantic-advice)",
  },
  VENDORS_CERT: {
    label: "Vendor Cert",
    icon: "🎖️",
    bgVar: "var(--copper-semantic-advice-container)",
    textVar: "var(--copper-semantic-on-advice-container)",
    color: "var(--copper-semantic-advice)",
  },
  AGREEMENT: {
    label: "Agreement",
    icon: "📜",
    bgVar: "var(--md-sys-color-tertiary-container)",
    textVar: "var(--md-sys-color-on-tertiary-container)",
    color: "var(--md-sys-color-tertiary)",
  },
  AGREEMENT_TERM: {
    label: "Agreement Term",
    icon: "📝",
    bgVar: "var(--md-sys-color-tertiary-container)",
    textVar: "var(--md-sys-color-on-tertiary-container)",
    color: "var(--md-sys-color-tertiary)",
  },
  AGREEMENT_SIGNATURE: {
    label: "Signature",
    icon: "✍️",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  DESIGN: {
    label: "Design",
    icon: "📐",
    bgVar: "var(--md-sys-color-primary-container)",
    textVar: "var(--md-sys-color-on-primary-container)",
    color: "var(--md-sys-color-primary)",
  },
  DESIGN_LINE: {
    label: "Design Line",
    icon: "📏",
    bgVar: "var(--md-sys-color-primary-container)",
    textVar: "var(--md-sys-color-on-primary-container)",
    color: "var(--md-sys-color-primary)",
  },
  DEVICE: {
    label: "Device",
    icon: "🖥️",
    bgVar: "var(--md-sys-color-primary-container)",
    textVar: "var(--md-sys-color-on-primary-container)",
    color: "var(--md-sys-color-primary)",
  },
  PORT: {
    label: "Port",
    icon: "🔌",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-secondary)",
  },
  SIGNAL_CHAIN: {
    label: "Signal Chain",
    icon: "⚡",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  RACK: {
    label: "Rack",
    icon: "🗄️",
    bgVar: "var(--md-sys-color-surface-container-highest)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-outline)",
  },
  CABLE: {
    label: "Cable",
    icon: "〰️",
    bgVar: "var(--md-sys-color-surface-container-high)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-secondary)",
  },
  STOCK_LOCATION: {
    label: "Stock Location",
    icon: "🏬",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-secondary)",
  },
  INVENTORY_ITEM: {
    label: "Inventory Item",
    icon: "📦",
    bgVar: "var(--md-sys-color-surface-container-low)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-primary)",
  },
  INVENTORY_RMA: {
    label: "RMA",
    icon: "🔄",
    bgVar: "var(--copper-semantic-risk-container)",
    textVar: "var(--copper-semantic-on-risk-container)",
    color: "var(--copper-semantic-risk)",
  },
  PROJECT_PROJECT: {
    label: "Project",
    icon: "📁",
    bgVar: "var(--md-sys-color-surface-variant)",
    textVar: "var(--md-sys-color-on-surface-variant)",
    color: "var(--md-sys-color-primary)",
  },
  PROJECT_GATE: {
    label: "Project Gate",
    icon: "🚧",
    bgVar: "var(--copper-semantic-risk-container)",
    textVar: "var(--copper-semantic-on-risk-container)",
    color: "var(--copper-semantic-risk)",
  },
  PROJECT_TASK: {
    label: "Project Task",
    icon: "☑️",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--copper-semantic-advice)",
  },
  PROJECT_CASE_STUDY: {
    label: "Case Study",
    icon: "📖",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-tertiary)",
  },
  INVOICE: {
    label: "Invoice",
    icon: "💳",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-tertiary)",
  },
  POSTING: {
    label: "Posting",
    icon: "📊",
    bgVar: "var(--md-sys-color-surface-container-low)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-tertiary)",
  },
  PERIOD: {
    label: "Period",
    icon: "📅",
    bgVar: "var(--md-sys-color-surface-container)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-secondary)",
  },
  MARGIN: {
    label: "Margin",
    icon: "📈",
    bgVar: "var(--md-sys-color-secondary-container)",
    textVar: "var(--md-sys-color-on-secondary-container)",
    color: "var(--md-sys-color-secondary)",
  },
  WORK_ORDER: {
    label: "Work Order",
    icon: "🔧",
    bgVar: "var(--copper-semantic-risk-container)",
    textVar: "var(--copper-semantic-on-risk-container)",
    color: "var(--copper-semantic-risk)",
  },
  ACTION: {
    label: "Action",
    icon: "⚡",
    bgVar: "var(--md-sys-color-surface-container-highest)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-primary)",
  },
  NAV: {
    label: "Navigation",
    icon: "🧭",
    bgVar: "var(--md-sys-color-surface-container-highest)",
    textVar: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-primary)",
  },
};

/**
 * Resolves metadata (label, icon, color tokens) for any entity type.
 * Handles case insensitivity, hyphens/underscores, and provides fallback.
 */
export function getEntityMetadata(type: string): EntityDesignMetadata {
  if (!type) {
    return {
      label: "Unknown",
      icon: "🔹",
      bgVar: "var(--md-sys-color-surface-container-high)",
      textVar: "var(--md-sys-color-on-surface)",
    };
  }
  const normalized = type.toUpperCase().replace(/-/g, "_");
  return (
    ENTITY_METADATA[normalized] || {
      label: type,
      icon: "🔹",
      bgVar: "var(--md-sys-color-surface-container-high)",
      textVar: "var(--md-sys-color-on-surface)",
    }
  );
}
