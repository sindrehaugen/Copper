import { z } from "zod";

/**
 * Canonical entity types from NCE node-ownership.json and vertical domain models.
 * (Batch 139 / OB.W1 - Contract-G: The graph is the router)
 */
export const ENTITY_TYPES = [
  "PRODUCT_SKU",
  "PRODUCT",
  "PO",
  "PO_LINE",
  "PROCUREMENT_MATCH",
  "FUNCTIONAL_LOCATION",
  "ROOM",
  "DESIGN",
  "DESIGN_LINE",
  "PROJECT_PROJECT",
  "PROJECT_GATE",
  "PROJECT_TASK",
  "PROJECT_CASE_STUDY",
  "DEVICE",
  "PORT",
  "SIGNAL_CHAIN",
  "RACK",
  "CABLE",
  "CUSTOMER",
  "LEAD",
  "OPPORTUNITY",
  "DEAL",
  "QUOTE",
  "SIGNED_BASELINE",
  "VENDOR",
  "CONTRACTOR",
  "CERT",
  "VENDORS_CERT",
  "AGREEMENT",
  "AGREEMENT_TERM",
  "AGREEMENT_SIGNATURE",
  "INVOICE",
  "POSTING",
  "PERIOD",
  "MARGIN",
  "STOCK_LOCATION",
  "INVENTORY_ITEM",
  "GOODS_RECEIPT",
  "INVENTORY_RMA",
  "ASSET",
  "TICKET",
  "WORK_ORDER",
] as const;

/**
 * Zod schema for validating known entity type names.
 */
export const EntityTypeSchema = z.enum(ENTITY_TYPES);

export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * Zod schema for strict EntityRef validation.
 */
export const EntityRefSchema = z
  .object({
    type: EntityTypeSchema,
    id: z.string().min(1, "Entity ID cannot be empty"),
    namespace: z.string().optional(),
  })
  .strict();

export type EntityRef = z.infer<typeof EntityRefSchema>;

/**
 * Type guard to check if an unknown string is a valid canonical EntityType.
 */
export function isEntityType(type: unknown): type is EntityType {
  if (typeof type !== "string") return false;
  const normalized = type.toUpperCase().replace(/-/g, "_");
  return (ENTITY_TYPES as readonly string[]).includes(normalized);
}

/**
 * Parses an entity reference string or object into a typed EntityRef.
 * Supports "TYPE:ID", "/e/TYPE/ID", or `{ type, id, namespace }`.
 */
export function parseEntityRef(input: string | { type: string; id: string; namespace?: string }): EntityRef {
  if (typeof input === "object" && input !== null) {
    const normalizedType = input.type.toUpperCase().replace(/-/g, "_");
    return EntityRefSchema.parse({
      type: normalizedType,
      id: input.id,
      namespace: input.namespace,
    });
  }

  if (typeof input === "string") {
    // Check route format: /e/:type/:id
    if (input.startsWith("/e/")) {
      const parts = input.slice(3).split("/");
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return EntityRefSchema.parse({
          type: parts[0].toUpperCase().replace(/-/g, "_"),
          id: decodeURIComponent(parts.slice(1).join("/")),
        });
      }
    }

    // Check colon format: TYPE:ID
    const colonIndex = input.indexOf(":");
    if (colonIndex > 0) {
      const rawType = input.slice(0, colonIndex);
      const rawId = input.slice(colonIndex + 1);
      return EntityRefSchema.parse({
        type: rawType.toUpperCase().replace(/-/g, "_"),
        id: rawId,
      });
    }
  }

  throw new Error(`Invalid entity reference: ${JSON.stringify(input)}`);
}

/**
 * Formats a typed EntityRef into a canonical string representation.
 */
export function formatEntityRef(ref: EntityRef, format: "colon" | "route" = "colon"): string {
  if (format === "route") {
    return `/e/${ref.type}/${encodeURIComponent(ref.id)}`;
  }
  return `${ref.type}:${ref.id}`;
}
