import React from "react";
import type { EntityType as SchemaEntityType } from "@copper/schema";
import { getEntityMetadata, ENTITY_METADATA, type EntityDesignMetadata } from "@copper/design";

export type EntityType = SchemaEntityType | string;

export interface EntityChipProps {
  type: EntityType;
  id?: string | undefined;
  code?: string | undefined;
  label?: string | undefined;
  score?: number | undefined;
  icon?: React.ReactNode | undefined;
  variant?: ("default" | "outline" | "compact" | "filter") | undefined;
  status?: string | undefined;
  onClick?: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  "data-testid"?: string | undefined;
}

export const ENTITY_TYPE_CONFIG = ENTITY_METADATA;

export function getEntityTypeConfig(type: string): EntityDesignMetadata {
  return getEntityMetadata(type);
}

export function EntityChip({
  type,
  id,
  code,
  label,
  score,
  icon,
  variant = "default",
  status,
  onClick,
  className = "",
  style = {},
  "data-testid": testId,
}: EntityChipProps) {
  const config = getEntityTypeConfig(type);
  const displayLabel = label || config.label;
  const displayIcon = icon ?? config.icon;
  const isOutline = variant === "outline";
  const isCompact = variant === "compact";

  const chipStyle: React.CSSProperties = {
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

  const codeStyle: React.CSSProperties = {
    fontFamily: "var(--copper-font-family-mono, monospace)",
    fontVariantNumeric: "tabular-nums",
    opacity: 0.85,
    fontSize: "0.75em",
  };

  const content = (
    <>
      {displayIcon && <span className="copper-entity-chip__icon" aria-hidden="true">{displayIcon}</span>}
      <span className="copper-entity-chip__label">{displayLabel}</span>
      {(code || id) && (
        <span className="copper-entity-chip__code" style={codeStyle}>
          {code || id}
        </span>
      )}
      {status && (
        <span
          className="copper-entity-chip__status"
          style={{
            fontSize: "0.7em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          • {status}
        </span>
      )}
      {typeof score === "number" && (
        <span
          className="copper-entity-chip__score"
          style={{
            fontSize: "0.7em",
            opacity: 0.7,
            fontFamily: "var(--copper-font-family-mono, monospace)",
          }}
        >
          {Math.round(score * 100)}%
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`copper-entity-chip copper-entity-chip--${type.toLowerCase()} ${className}`}
        style={chipStyle}
        onClick={onClick}
        data-testid={testId || `entity-chip-${type.toLowerCase()}`}
        data-entity-type={type}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={`copper-entity-chip copper-entity-chip--${type.toLowerCase()} ${className}`}
      style={chipStyle}
      data-testid={testId || `entity-chip-${type.toLowerCase()}`}
      data-entity-type={type}
    >
      {content}
    </span>
  );
}
