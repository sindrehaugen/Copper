import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { findingRegistry } from "../../shell/finding/registry";
import type { Finding, EntityRefInput } from "../../shell/finding/types";

export const THREE_WAY_MATCH_PRODUCER_ID = "three-way-match";

export interface RawThreeWayMatchRecord {
  id: string;
  rule: string;
  severity: "blocker" | "risk";
  messageKey: string;
  defaultMessage: string;
  fixId: string;
  fixLabelKey: string;
  defaultFixLabel: string;
  entityRef?: EntityRefInput;
  poNumber?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  poPrice?: number;
  invoicePrice?: number;
  poQuantity?: number;
  receiptQuantity?: number;
  invoiceQuantity?: number;
  evidence?: Record<string, unknown>;
  provenanceRef?: string;
}

export const DEFAULT_THREE_WAY_MATCH_ITEMS: RawThreeWayMatchRecord[] = [
  {
    id: "twm-invoice-price-exceeds-po",
    rule: "price-mismatch",
    severity: "blocker",
    messageKey: "sourcing.match.invoicePriceExceedsPo",
    defaultMessage: "Invoice price exceeds PO price",
    fixId: "fix-price-mismatch",
    fixLabelKey: "sourcing.match.fixPriceMismatch",
    defaultFixLabel: "Adjust PO price to match invoice",
    poNumber: "PO-2026-8801",
    invoiceNumber: "INV-99201",
    poPrice: 1200,
    invoicePrice: 1450,
    evidence: {
      poPrice: 1200,
      invoicePrice: 1450,
      discrepancy: 250,
      currency: "EUR",
      poNumber: "PO-2026-8801",
      invoiceNumber: "INV-99201",
    },
    provenanceRef: "prov://sourcing/match/twm-invoice-price-exceeds-po",
  },
  {
    id: "twm-receipt-quantity-missing",
    rule: "receipt-quantity-missing",
    severity: "blocker",
    messageKey: "sourcing.match.receiptQuantityMissing",
    defaultMessage: "Receipt quantity missing",
    fixId: "fix-receipt-quantity",
    fixLabelKey: "sourcing.match.fixReceiptQuantity",
    defaultFixLabel: "Generate goods receipt note",
    poNumber: "PO-2026-8802",
    invoiceNumber: "INV-99202",
    poQuantity: 10,
    receiptQuantity: 0,
    invoiceQuantity: 10,
    evidence: {
      poQuantity: 10,
      receiptQuantity: 0,
      invoiceQuantity: 10,
      dockStatus: "unreceived",
      poNumber: "PO-2026-8802",
      invoiceNumber: "INV-99202",
    },
    provenanceRef: "prov://sourcing/match/twm-receipt-quantity-missing",
  },
  {
    id: "twm-quantity-mismatch",
    rule: "quantity-mismatch",
    severity: "risk",
    messageKey: "sourcing.match.invoiceQuantityExceedsPo",
    defaultMessage: "Invoice quantity exceeds PO quantity",
    fixId: "fix-quantity-mismatch",
    fixLabelKey: "sourcing.match.fixQuantityMismatch",
    defaultFixLabel: "Authorize partial quantity variance",
    poNumber: "PO-2026-8803",
    invoiceNumber: "INV-99203",
    poQuantity: 50,
    receiptQuantity: 50,
    invoiceQuantity: 55,
    evidence: {
      poQuantity: 50,
      receiptQuantity: 50,
      invoiceQuantity: 55,
      variance: 5,
      poNumber: "PO-2026-8803",
      invoiceNumber: "INV-99203",
    },
    provenanceRef: "prov://sourcing/match/twm-quantity-mismatch",
  },
];

export function mapMatchRecordToFinding(
  record: RawThreeWayMatchRecord,
  t: (key: string, defaultValue?: string) => string,
  entityRef?: EntityRefInput,
  customFixHandler?: (findingId: string) => void | Promise<void>
): Finding {
  return {
    id: record.id,
    severity: record.severity,
    rule: record.rule,
    message: t(record.messageKey, record.defaultMessage),
    entityRef: entityRef ?? record.entityRef,
    evidence: record.evidence ?? {
      poNumber: record.poNumber,
      invoiceNumber: record.invoiceNumber,
      receiptNumber: record.receiptNumber,
      poPrice: record.poPrice,
      invoicePrice: record.invoicePrice,
      poQuantity: record.poQuantity,
      receiptQuantity: record.receiptQuantity,
      invoiceQuantity: record.invoiceQuantity,
    },
    provenanceRef: record.provenanceRef ?? `prov://sourcing/match/${record.id}`,
    fix: {
      id: record.fixId,
      label: t(record.fixLabelKey, record.defaultFixLabel),
      apply: async () => {
        if (customFixHandler) {
          await customFixHandler(record.id);
        }
        findingRegistry.clearFinding(record.id);
      },
    },
    producerId: THREE_WAY_MATCH_PRODUCER_ID,
    timestamp: Date.now(),
  };
}

export function mapMatchRecordsToFindings(
  records: RawThreeWayMatchRecord[],
  t: (key: string, defaultValue?: string) => string,
  entityRef?: EntityRefInput,
  customFixHandler?: (findingId: string) => void | Promise<void>
): Finding[] {
  return records.map((record) =>
    mapMatchRecordToFinding(record, t, entityRef, customFixHandler)
  );
}

export async function fetchThreeWayMatchData(
  endpoint = "/api/sourcing/match"
): Promise<RawThreeWayMatchRecord[]> {
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    try {
      const response = await window.fetch(endpoint);
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // Mock data fallback on network or test environment
    }
  }
  return DEFAULT_THREE_WAY_MATCH_ITEMS;
}

export interface ThreeWayMatchProviderProps {
  entityType?: string;
  entityId?: string;
  entityRef?: EntityRefInput;
  endpoint?: string;
  mockData?: RawThreeWayMatchRecord[];
  enabled?: boolean;
  onFix?: (findingId: string) => void | Promise<void>;
  onLoaded?: (findings: Finding[]) => void;
}

/**
 * ThreeWayMatchProvider (Batch 176 / Sourcing Finding Producer)
 *
 * Renders invisibly (returns null). On mount, simulates fetching `/api/sourcing/match`
 * and registers three-way match discrepancies (price mismatch, missing receipt quantity)
 * into `findingRegistry` under producerId "three-way-match".
 * Cleans up findings on unmount.
 */
export function ThreeWayMatchProvider({
  entityType,
  entityId,
  entityRef: explicitEntityRef,
  endpoint = "/api/sourcing/match",
  mockData,
  enabled = true,
  onFix,
  onLoaded,
}: ThreeWayMatchProviderProps): null {
  const { t } = useTranslation();

  useEffect(() => {
    if (!enabled) {
      findingRegistry.setProducerFindings(THREE_WAY_MATCH_PRODUCER_ID, []);
      return;
    }

    let isMounted = true;

    const computedEntityRef: EntityRefInput | undefined =
      explicitEntityRef ??
      (entityId
        ? { type: entityType || "SOURCING", id: entityId }
        : entityType
        ? { type: entityType, id: "match" }
        : undefined);

    // Initial registration with mock items for immediate availability
    const initialRecords = mockData ?? DEFAULT_THREE_WAY_MATCH_ITEMS;
    const initialFindings = mapMatchRecordsToFindings(
      initialRecords,
      t,
      computedEntityRef,
      onFix
    );
    findingRegistry.setProducerFindings(THREE_WAY_MATCH_PRODUCER_ID, initialFindings);
    onLoaded?.(initialFindings);

    // Simulate / execute fetch to endpoint if mockData override wasn't explicitly passed
    if (!mockData && typeof window !== "undefined" && typeof window.fetch === "function") {
      fetchThreeWayMatchData(endpoint)
        .then((records) => {
          if (isMounted && records !== initialRecords) {
            const mapped = mapMatchRecordsToFindings(
              records,
              t,
              computedEntityRef,
              onFix
            );
            findingRegistry.setProducerFindings(THREE_WAY_MATCH_PRODUCER_ID, mapped);
            onLoaded?.(mapped);
          }
        })
        .catch(() => {
          // Handled gracefully with fallback mock data
        });
    }

    return () => {
      isMounted = false;
      findingRegistry.setProducerFindings(THREE_WAY_MATCH_PRODUCER_ID, []);
    };
  }, [
    enabled,
    entityType,
    entityId,
    explicitEntityRef,
    endpoint,
    mockData,
    onFix,
    onLoaded,
    t,
  ]);

  return null;
}
