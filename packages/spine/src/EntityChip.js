import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const ENTITY_TYPE_CONFIG = {
    FUNCTIONAL_LOCATION: {
        label: "Location",
        icon: "🏢",
        bgVar: "var(--md-sys-color-secondary-container)",
        textVar: "var(--md-sys-color-on-secondary-container)",
    },
    ROOM: {
        label: "Room",
        icon: "🏢",
        bgVar: "var(--md-sys-color-secondary-container)",
        textVar: "var(--md-sys-color-on-secondary-container)",
    },
    ASSET: {
        label: "Asset",
        icon: "📦",
        bgVar: "var(--md-sys-color-primary-container)",
        textVar: "var(--md-sys-color-on-primary-container)",
    },
    QUOTE: {
        label: "Quote",
        icon: "📄",
        bgVar: "var(--md-sys-color-tertiary-container)",
        textVar: "var(--md-sys-color-on-tertiary-container)",
    },
    TICKET: {
        label: "Ticket",
        icon: "🎫",
        bgVar: "var(--copper-semantic-advice-container)",
        textVar: "var(--copper-semantic-on-advice-container)",
    },
    CUSTOMER: {
        label: "Customer",
        icon: "👤",
        bgVar: "var(--md-sys-color-surface-variant)",
        textVar: "var(--md-sys-color-on-surface-variant)",
    },
    PRODUCT: {
        label: "Product",
        icon: "🏷️",
        bgVar: "var(--md-sys-color-surface-container-high)",
        textVar: "var(--md-sys-color-on-surface)",
    },
    VENDOR: {
        label: "Vendor",
        icon: "🤝",
        bgVar: "var(--md-sys-color-surface-container)",
        textVar: "var(--md-sys-color-on-surface)",
    },
    AGREEMENT: {
        label: "Agreement",
        icon: "📜",
        bgVar: "var(--md-sys-color-tertiary-container)",
        textVar: "var(--md-sys-color-on-tertiary-container)",
    },
    DESIGN: {
        label: "Design",
        icon: "📐",
        bgVar: "var(--md-sys-color-primary-container)",
        textVar: "var(--md-sys-color-on-primary-container)",
    },
    WORK_ORDER: {
        label: "Work Order",
        icon: "🔧",
        bgVar: "var(--copper-semantic-risk-container)",
        textVar: "var(--copper-semantic-on-risk-container)",
    },
    ACTION: {
        label: "Action",
        icon: "⚡",
        bgVar: "var(--md-sys-color-surface-container-highest)",
        textVar: "var(--md-sys-color-on-surface)",
    },
    NAV: {
        label: "Navigation",
        icon: "🧭",
        bgVar: "var(--md-sys-color-surface-container-highest)",
        textVar: "var(--md-sys-color-on-surface)",
    },
};
export function getEntityTypeConfig(type) {
    const norm = type.toUpperCase().replace(/-/g, "_");
    return (ENTITY_TYPE_CONFIG[norm] || {
        label: type,
        icon: "🔹",
        bgVar: "var(--md-sys-color-surface-container-high)",
        textVar: "var(--md-sys-color-on-surface)",
    });
}
export function EntityChip({ type, id, code, label, score, icon, variant = "default", status, onClick, className = "", style = {}, "data-testid": testId, }) {
    const config = getEntityTypeConfig(type);
    const displayLabel = label || config.label;
    const displayIcon = icon ?? config.icon;
    const isOutline = variant === "outline";
    const isCompact = variant === "compact";
    const chipStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: isCompact ? "4px" : "6px",
        padding: isCompact ? "2px 6px" : "3px 8px",
        borderRadius: "var(--md-sys-shape-corner-small, 8px)",
        fontSize: isCompact ? "0.75rem" : "0.8125rem",
        fontWeight: 500,
        lineHeight: "1.2",
        backgroundColor: isOutline ? "transparent" : config.bgVar,
        color: config.textVar,
        border: isOutline
            ? `1px solid ${config.borderVar || "var(--md-sys-color-outline-variant)"}`
            : "1px solid transparent",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        ...style,
    };
    const codeStyle = {
        fontFamily: "var(--copper-font-family-mono, monospace)",
        fontVariantNumeric: "tabular-nums",
        opacity: 0.85,
        fontSize: "0.75em",
    };
    const content = (_jsxs(_Fragment, { children: [displayIcon && _jsx("span", { className: "copper-entity-chip__icon", "aria-hidden": "true", children: displayIcon }), _jsx("span", { className: "copper-entity-chip__label", children: displayLabel }), (code || id) && (_jsx("span", { className: "copper-entity-chip__code", style: codeStyle, children: code || id })), status && (_jsxs("span", { className: "copper-entity-chip__status", style: {
                    fontSize: "0.7em",
                    textTransform: "uppercase",
                    opacity: 0.75,
                }, children: ["\u2022 ", status] })), typeof score === "number" && (_jsxs("span", { className: "copper-entity-chip__score", style: {
                    fontSize: "0.7em",
                    opacity: 0.7,
                    fontFamily: "var(--copper-font-family-mono, monospace)",
                }, children: [Math.round(score * 100), "%"] }))] }));
    if (onClick) {
        return (_jsx("button", { type: "button", className: `copper-entity-chip copper-entity-chip--${type.toLowerCase()} ${className}`, style: chipStyle, onClick: onClick, "data-testid": testId || `entity-chip-${type.toLowerCase()}`, "data-entity-type": type, children: content }));
    }
    return (_jsx("span", { className: `copper-entity-chip copper-entity-chip--${type.toLowerCase()} ${className}`, style: chipStyle, "data-testid": testId || `entity-chip-${type.toLowerCase()}`, "data-entity-type": type, children: content }));
}
