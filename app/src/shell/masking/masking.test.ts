import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { maskingStore, MaskingStore } from "./masking-store.js";
import { getMaskingHeaders, withMaskingHeaders, CUSTOMER_VIEW_HEADER, DATA_CUSTOMER_VIEW_ATTR } from "./masking-headers.js";

describe("Masking Store & Headers (SH.W6 / B134)", () => {
  beforeEach(() => {
    maskingStore.setMasked(false);
    document.body.removeAttribute(DATA_CUSTOMER_VIEW_ATTR);
  });

  afterEach(() => {
    maskingStore.setMasked(false);
    document.body.removeAttribute(DATA_CUSTOMER_VIEW_ATTR);
  });

  describe("getMaskingHeaders", () => {
    it("returns empty object when unmasked", () => {
      expect(getMaskingHeaders(false)).toEqual({});
    });

    it("returns x-customer-view header when masked", () => {
      expect(getMaskingHeaders(true)).toEqual({
        [CUSTOMER_VIEW_HEADER]: "true",
      });
    });
  });

  describe("withMaskingHeaders", () => {
    it("returns original headers when unmasked", () => {
      const headers = { "Authorization": "Bearer token" };
      expect(withMaskingHeaders(headers, false)).toEqual(headers);
    });

    it("injects x-customer-view into plain object headers when masked", () => {
      const headers = { "Authorization": "Bearer token" };
      const merged = withMaskingHeaders(headers, true) as Record<string, string>;
      expect(merged.Authorization).toBe("Bearer token");
      expect(merged[CUSTOMER_VIEW_HEADER]).toBe("true");
    });

    it("injects x-customer-view into Headers instance when masked", () => {
      const headers = new Headers({ "Content-Type": "application/json" });
      const merged = withMaskingHeaders(headers, true) as Headers;
      expect(merged.get("Content-Type")).toBe("application/json");
      expect(merged.get(CUSTOMER_VIEW_HEADER)).toBe("true");
    });

    it("injects x-customer-view into array of headers when masked", () => {
      const headers: [string, string][] = [["Accept", "application/json"]];
      const merged = withMaskingHeaders(headers, true) as [string, string][];
      expect(merged).toContainEqual([CUSTOMER_VIEW_HEADER, "true"]);
    });
  });

  describe("MaskingStore", () => {
    it("toggles masked state and synchronizes DOM attribute", () => {
      const store = new MaskingStore();
      expect(store.isMasked).toBe(false);
      expect(document.body.hasAttribute(DATA_CUSTOMER_VIEW_ATTR)).toBe(false);

      store.toggleMasked();
      expect(store.isMasked).toBe(true);
      expect(document.body.getAttribute(DATA_CUSTOMER_VIEW_ATTR)).toBe("true");

      store.toggleMasked();
      expect(store.isMasked).toBe(false);
      expect(document.body.hasAttribute(DATA_CUSTOMER_VIEW_ATTR)).toBe(false);
    });

    it("notifies subscribers when state changes", () => {
      const store = new MaskingStore();
      let notifiedValue: boolean | null = null;
      const unsubscribe = store.subscribe((val) => {
        notifiedValue = val;
      });

      store.setMasked(true);
      expect(notifiedValue).toBe(true);

      store.setMasked(false);
      expect(notifiedValue).toBe(false);

      unsubscribe();
      store.setMasked(true);
      expect(notifiedValue).toBe(false); // Unsubscribed, was not called
    });
  });
});
