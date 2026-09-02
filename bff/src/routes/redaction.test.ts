import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import { redactC8Profile, isMaskingRequested, customerViewMaskingMiddleware, isC8RedactedKey } from "./redaction.js";

describe("NCE C8 Redaction Profile & Customer-View Masking (SH.W6 / B134)", () => {
  describe("isC8RedactedKey", () => {
    it("matches all margin key variations", () => {
      expect(isC8RedactedKey("margin")).toBe(true);
      expect(isC8RedactedKey("gross_margin")).toBe(true);
      expect(isC8RedactedKey("profit_margin")).toBe(true);
      expect(isC8RedactedKey("target_margin")).toBe(true);
      expect(isC8RedactedKey("margin_percent")).toBe(true);
      expect(isC8RedactedKey("margin_rate")).toBe(true);
      expect(isC8RedactedKey("margin_amount")).toBe(true);
      expect(isC8RedactedKey("marginAmount")).toBe(true);
      expect(isC8RedactedKey("marginPercent")).toBe(true);
      expect(isC8RedactedKey("grossMargin")).toBe(true);
      expect(isC8RedactedKey("profitMargin")).toBe(true);
    });

    it("matches all cost key variations", () => {
      expect(isC8RedactedKey("cost")).toBe(true);
      expect(isC8RedactedKey("unit_cost")).toBe(true);
      expect(isC8RedactedKey("unitCost")).toBe(true);
      expect(isC8RedactedKey("total_cost")).toBe(true);
      expect(isC8RedactedKey("totalCost")).toBe(true);
      expect(isC8RedactedKey("cost_price")).toBe(true);
      expect(isC8RedactedKey("costPrice")).toBe(true);
      expect(isC8RedactedKey("internal_cost")).toBe(true);
      expect(isC8RedactedKey("internalCost")).toBe(true);
      expect(isC8RedactedKey("purchase_cost")).toBe(true);
      expect(isC8RedactedKey("purchaseCost")).toBe(true);
      expect(isC8RedactedKey("estimated_cost")).toBe(true);
      expect(isC8RedactedKey("labor_cost")).toBe(true);
      expect(isC8RedactedKey("material_cost")).toBe(true);
      expect(isC8RedactedKey("cogs")).toBe(true);
    });

    it("matches all internal notes variations", () => {
      expect(isC8RedactedKey("internal_notes")).toBe(true);
      expect(isC8RedactedKey("internalNotes")).toBe(true);
      expect(isC8RedactedKey("internal_note")).toBe(true);
      expect(isC8RedactedKey("internalNote")).toBe(true);
      expect(isC8RedactedKey("private_notes")).toBe(true);
      expect(isC8RedactedKey("privateNotes")).toBe(true);
      expect(isC8RedactedKey("admin_notes")).toBe(true);
      expect(isC8RedactedKey("adminNotes")).toBe(true);
      expect(isC8RedactedKey("technician_notes")).toBe(true);
      expect(isC8RedactedKey("confidential_notes")).toBe(true);
      expect(isC8RedactedKey("internal_comments")).toBe(true);
      expect(isC8RedactedKey("internal_remarks")).toBe(true);
    });

    it("matches all health score variations", () => {
      expect(isC8RedactedKey("health_score")).toBe(true);
      expect(isC8RedactedKey("healthScore")).toBe(true);
      expect(isC8RedactedKey("customer_health")).toBe(true);
      expect(isC8RedactedKey("customerHealth")).toBe(true);
      expect(isC8RedactedKey("health_rating")).toBe(true);
      expect(isC8RedactedKey("healthRating")).toBe(true);
      expect(isC8RedactedKey("churn_risk")).toBe(true);
      expect(isC8RedactedKey("churnRisk")).toBe(true);
      expect(isC8RedactedKey("churn_probability")).toBe(true);
      expect(isC8RedactedKey("account_health")).toBe(true);
      expect(isC8RedactedKey("accountHealth")).toBe(true);
      expect(isC8RedactedKey("churn_score")).toBe(true);
    });

    it("does not match non-sensitive business keys", () => {
      expect(isC8RedactedKey("id")).toBe(false);
      expect(isC8RedactedKey("title")).toBe(false);
      expect(isC8RedactedKey("name")).toBe(false);
      expect(isC8RedactedKey("price")).toBe(false);
      expect(isC8RedactedKey("unit_price")).toBe(false);
      expect(isC8RedactedKey("total_price")).toBe(false);
      expect(isC8RedactedKey("description")).toBe(false);
      expect(isC8RedactedKey("status")).toBe(false);
      expect(isC8RedactedKey("customer_name")).toBe(false);
      expect(isC8RedactedKey("quantity")).toBe(false);
    });
  });

  describe("isMaskingRequested", () => {
    it("returns true for x-customer-view header", () => {
      expect(isMaskingRequested({ header: (name: string) => name === "x-customer-view" ? "true" : null } as any)).toBe(true);
      expect(isMaskingRequested({ header: (name: string) => name === "x-customer-view" ? "1" : null } as any)).toBe(true);
      expect(isMaskingRequested({ header: (name: string) => name === "x-customer-view" ? "yes" : null } as any)).toBe(true);
    });

    it("returns true for data-customer-view header", () => {
      expect(isMaskingRequested({ header: (name: string) => name === "data-customer-view" ? "true" : null } as any)).toBe(true);
    });

    it("returns true for x-copper-masking header", () => {
      expect(isMaskingRequested({ header: (name: string) => name === "x-copper-masking" ? "true" : null } as any)).toBe(true);
    });

    it("returns true for customer_view query parameter", () => {
      expect(isMaskingRequested({ header: () => null, query: (name: string) => name === "customer_view" ? "true" : null } as any)).toBe(true);
    });

    it("returns false when masking headers or queries are missing or false", () => {
      expect(isMaskingRequested({ header: () => null, query: () => null } as any)).toBe(false);
      expect(isMaskingRequested({ header: () => "false", query: () => "false" } as any)).toBe(false);
      expect(isMaskingRequested({ header: () => "0", query: () => "0" } as any)).toBe(false);
    });
  });

  describe("redactC8Profile recursive stripping", () => {
    it("handles primitives and null/undefined safely", () => {
      expect(redactC8Profile(null)).toBe(null);
      expect(redactC8Profile(undefined)).toBe(undefined);
      expect(redactC8Profile(123)).toBe(123);
      expect(redactC8Profile("text")).toBe("text");
      expect(redactC8Profile(true)).toBe(true);
    });

    it("handles Date and RegExp objects", () => {
      const now = new Date();
      expect(redactC8Profile(now)).toBe(now);
      const regex = /abc/g;
      expect(redactC8Profile(regex)).toBe(regex);
    });

    it("handles circular references gracefully", () => {
      const obj: any = { name: "Test", margin: 50 };
      obj.self = obj;
      const redacted = redactC8Profile(obj);
      expect(redacted.name).toBe("Test");
      expect(redacted.margin).toBeUndefined();
      expect(redacted.self).toBeDefined();
    });

    it("filters out internal notes from arrays while preserving public notes", () => {
      const notes = [
        { id: "1", text: "Customer visible note", is_internal: false },
        { id: "2", text: "Confidential cost note", is_internal: true },
        { id: "3", text: "Internal tech note", visibility: "internal" },
        { id: "4", text: "Private remark", private: true },
        { id: "5", text: "Another public note", is_internal: false }
      ];

      const redacted = redactC8Profile(notes);
      expect(redacted).toHaveLength(2);
      expect(redacted[0].text).toBe("Customer visible note");
      expect(redacted[1].text).toBe("Another public note");
    });
  });

  describe("HTTP Boundary Acceptance Tests (BFF redaction vs Client-only mask)", () => {
    let testApp: Hono;

    const fixtureData = {
      quote_id: "Q-2026-889",
      customer: "Acme Corp",
      items: [
        {
          id: "item-1",
          sku: "SPK-CEIL-01",
          name: "Ceiling Speaker 8in",
          quantity: 12,
          unit_price: 350,
          total_price: 4200,
          unit_cost: 180,
          total_cost: 2160,
          margin: 2040,
          margin_percent: 48.57,
          notes: [
            { id: "n1", text: "Mounting kit included", is_internal: false },
            { id: "n2", text: "Supplier distributor discount 15%", is_internal: true }
          ]
        }
      ],
      pricing_summary: {
        subtotal: 4200,
        tax: 1050,
        total: 5250,
        cogs: 2160,
        gross_margin: 2040,
        target_margin: 0.45
      },
      customer_relationship: {
        status: "active",
        health_score: 88,
        churn_risk: 0.12,
        internal_notes: "Negotiating annual service level agreement. Do not share margin target."
      }
    };

    beforeEach(() => {
      testApp = new Hono();
      testApp.use("*", customerViewMaskingMiddleware());
      testApp.get("/api/test-quote", (c) => c.json(fixtureData));
    });

    it("RED-first verification: Unmasked request returns all commercial and internal data", async () => {
      const res = await testApp.request("/api/test-quote", {
        headers: {}
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // In unmasked operator mode, all fields reach the client
      expect(json.items[0].unit_cost).toBe(180);
      expect(json.items[0].total_cost).toBe(2160);
      expect(json.items[0].margin).toBe(2040);
      expect(json.items[0].margin_percent).toBe(48.57);
      expect(json.pricing_summary.cogs).toBe(2160);
      expect(json.pricing_summary.gross_margin).toBe(2040);
      expect(json.pricing_summary.target_margin).toBe(0.45);
      expect(json.customer_relationship.health_score).toBe(88);
      expect(json.customer_relationship.churn_risk).toBe(0.12);
      expect(json.customer_relationship.internal_notes).toContain("Negotiating annual service level agreement");
      expect(json.items[0].notes).toHaveLength(2);
    });

    it("BFF Boundary Acceptance: With x-customer-view header, sensitive fields NEVER reach the HTTP response body", async () => {
      const res = await testApp.request("/api/test-quote", {
        headers: {
          "x-customer-view": "true"
        }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("x-redaction-profile")).toBe("NCE-C8");
      expect(res.headers.get("x-customer-view-masked")).toBe("true");

      const responseText = await res.text();

      // Rigorous assertion: Sensitive terms and numbers must NOT appear anywhere in the raw HTTP response text!
      expect(responseText).not.toContain("unit_cost");
      expect(responseText).not.toContain("total_cost");
      expect(responseText).not.toContain("margin_percent");
      expect(responseText).not.toContain("gross_margin");
      expect(responseText).not.toContain("target_margin");
      expect(responseText).not.toContain("health_score");
      expect(responseText).not.toContain("churn_risk");
      expect(responseText).not.toContain("internal_notes");
      expect(responseText).not.toContain("Supplier distributor discount 15%");
      expect(responseText).not.toContain("Do not share margin target");

      // Verify parsed structure has clean schema
      const json = JSON.parse(responseText);
      expect(json.quote_id).toBe("Q-2026-889");
      expect(json.customer).toBe("Acme Corp");
      expect(json.items[0].name).toBe("Ceiling Speaker 8in");
      expect(json.items[0].unit_price).toBe(350);
      expect(json.items[0].total_price).toBe(4200);
      expect(json.items[0].unit_cost).toBeUndefined();
      expect(json.items[0].margin).toBeUndefined();
      expect(json.items[0].notes).toHaveLength(1);
      expect(json.items[0].notes[0].text).toBe("Mounting kit included");
      expect(json.pricing_summary.subtotal).toBe(4200);
      expect(json.pricing_summary.total).toBe(5250);
      expect(json.pricing_summary.gross_margin).toBeUndefined();
      expect(json.pricing_summary.cogs).toBeUndefined();
      expect(json.customer_relationship.status).toBe("active");
      expect(json.customer_relationship.health_score).toBeUndefined();
      expect(json.customer_relationship.internal_notes).toBeUndefined();
    });

    it("BFF Boundary Acceptance: Works with data-customer-view header", async () => {
      const res = await testApp.request("/api/test-quote", {
        headers: {
          "data-customer-view": "true"
        }
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.items[0].margin).toBeUndefined();
      expect(json.items[0].unit_cost).toBeUndefined();
      expect(json.customer_relationship.health_score).toBeUndefined();
      expect(json.customer_relationship.internal_notes).toBeUndefined();
    });

    it("BFF Boundary Acceptance: Works with customer_view=true query parameter", async () => {
      const res = await testApp.request("/api/test-quote?customer_view=true");

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.items[0].margin).toBeUndefined();
      expect(json.items[0].unit_cost).toBeUndefined();
      expect(json.customer_relationship.health_score).toBeUndefined();
      expect(json.customer_relationship.internal_notes).toBeUndefined();
    });
  });
});
