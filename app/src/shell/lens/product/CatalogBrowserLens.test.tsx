import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  CatalogBrowserLens,
  type ProductItem,
  DEFAULT_CATALOG_PRODUCTS,
} from "./CatalogBrowserLens";
import { EntityLens } from "../EntityLens";
import "../../../locales/i18n";

describe("Batch 172 (EN.W11) — Catalog Browser & PRODUCT Surface", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const testProductItem: ProductItem = {
    id: "prod-spk-bose-fs2c",
    sku: "FS2C-W-8R",
    name: "Bose FreeSpace FS2C In-Ceiling Loudspeaker",
    manufacturer: "Bose Professional",
    category: "Loudspeakers",
    description: "High-performance in-ceiling loudspeaker for background music and speech reproduction.",
    status: "in_stock",
    capabilities: ["8Ω", "200W", "ceiling", "in-ceiling", "passive", "70V/100V"],
    specs: {
      impedance: "8Ω",
      power: "200W",
      formFactor: "ceiling",
      frequencyResponse: "83 Hz - 19 kHz",
      maxSpl: "100 dB",
      coverageAngle: "150° conical",
    },
    specList: [
      { name: "Nominal Impedance", value: "8Ω", category: "acoustics" },
      { name: "Max Power Handling", value: "200W", category: "electrical" },
      { name: "Mounting / Enclosure", value: "In-Ceiling / Flush", category: "physical" },
      { name: "Frequency Response", value: "83 Hz - 19 kHz", category: "acoustics" },
      { name: "Max SPL", value: "100 dB", category: "acoustics" },
    ],
    stock: {
      onHand: 48,
      available: 36,
      reserved: 12,
      warehouseLocation: "Oslo Sentrallager - Bay 14-B",
      leadTimeDays: 2,
      minOrderQty: 2,
    },
    pricing: {
      currency: "EUR",
      listPrice: 189,
      costPrice: 115,
      dealerPrice: 142,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  };

  const testSwitchItem: ProductItem = {
    id: "prod-sw-cisco-9300-24ux",
    sku: "C9300-24UX-A",
    name: "Cisco Catalyst 9300 24-Port UPOE/PoE++ Switch",
    manufacturer: "Cisco Systems",
    category: "Network Switches",
    description: "Enterprise stackable 24-port multigigabit switch with 90W 802.3bt PoE++ per port.",
    status: "in_stock",
    capabilities: ["PoE++", "24p", "24-port", "802.3bt", "mGig", "Layer 3"],
    specs: {
      ports: "24p",
      poe: "PoE++",
      poeBudget: "830W",
      switchingCapacity: "128 Gbps",
      rackUnits: "1U",
      stackable: "Yes (StackWise-480)",
    },
    specList: [
      { name: "Network Ports", value: "24p Multi-Gigabit", category: "network" },
      { name: "PoE Capability", value: "PoE++ (802.3bt Type 4)", category: "electrical" },
      { name: "Total PoE Budget", value: "830W", category: "electrical" },
      { name: "Form Factor", value: "1U Rackmount", category: "physical" },
    ],
    stock: {
      onHand: 14,
      available: 9,
      reserved: 5,
      warehouseLocation: "Oslo Sentrallager - Rack C-04",
      leadTimeDays: 3,
      minOrderQty: 1,
    },
    pricing: {
      currency: "EUR",
      listPrice: 4250,
      costPrice: 2890,
      dealerPrice: 3450,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  };

  describe("Grid Lens View over Product Catalog", () => {
    it("renders grid lens conformance, column headers, KPIs, and items", () => {
      render(
        <MemoryRouter>
          <CatalogBrowserLens
            products={[testProductItem, testSwitchItem]}
          />
        </MemoryRouter>
      );

      // Verify Grid lens container
      const lensEl = screen.getByTestId("lens-grid");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-lens-kind")).toBe("grid");

      // Verify Header & KPI summary
      expect(screen.getAllByText(/Product Catalog/i).length).toBeGreaterThan(0);
      expect(screen.getByTestId("kpi-total-products")).toBeDefined();
      expect(screen.getByTestId("kpi-in-stock")).toBeDefined();

      // Verify Search & Capability inputs
      expect(screen.getByTestId("catalog-text-search-input")).toBeDefined();
      expect(screen.getByTestId("catalog-capability-search-input")).toBeDefined();

      // Verify table headers and row items
      expect(screen.getByText("FS2C-W-8R")).toBeDefined();
      expect(screen.getByText("Bose FreeSpace FS2C In-Ceiling Loudspeaker")).toBeDefined();
      expect(screen.getByText("C9300-24UX-A")).toBeDefined();
      expect(screen.getByText("Cisco Catalyst 9300 24-Port UPOE/PoE++ Switch")).toBeDefined();
    });
  });

  describe("Capability Search Interface", () => {
    it("filters catalog using capability search for '8Ω 200W ceiling'", () => {
      render(
        <MemoryRouter>
          <CatalogBrowserLens
            products={DEFAULT_CATALOG_PRODUCTS}
          />
        </MemoryRouter>
      );

      const capabilityInput = screen.getByTestId("catalog-capability-search-input");
      fireEvent.change(capabilityInput, { target: { value: "8Ω 200W ceiling" } });

      // Should match ceiling speakers with 8Ω and 200W specs
      expect(screen.getByText(/Bose FreeSpace FS2C/i)).toBeDefined();
      expect(screen.getByText(/QSC AcousticDesign AD-C6T/i)).toBeDefined();

      // Switches, microphones, and amplifiers should be filtered out
      expect(screen.queryByText(/Cisco Catalyst 9300/i)).toBeNull();
      expect(screen.queryByText(/Shure Microflex Advance MXA920/i)).toBeNull();
    });

    it("filters catalog using capability search for 'PoE++ 24p'", () => {
      render(
        <MemoryRouter>
          <CatalogBrowserLens
            products={DEFAULT_CATALOG_PRODUCTS}
          />
        </MemoryRouter>
      );

      const capabilityInput = screen.getByTestId("catalog-capability-search-input");
      fireEvent.change(capabilityInput, { target: { value: "PoE++ 24p" } });

      // Should match 24-port PoE++ switches
      expect(screen.getByText(/Cisco Catalyst 9300/i)).toBeDefined();
      expect(screen.getByText(/NETGEAR AV Line M4250/i)).toBeDefined();

      // Speakers and microphones should be filtered out
      expect(screen.queryByText(/Bose FreeSpace FS2C/i)).toBeNull();
      expect(screen.queryByText(/Shure Microflex Advance MXA920/i)).toBeNull();
    });

    it("activates capability search via preset chips", () => {
      render(
        <MemoryRouter>
          <CatalogBrowserLens
            products={DEFAULT_CATALOG_PRODUCTS}
          />
        </MemoryRouter>
      );

      const chip = screen.getByTestId("capability-chip-poe-24p");
      fireEvent.click(chip);

      expect(screen.getByText(/Cisco Catalyst 9300/i)).toBeDefined();
      expect(screen.queryByText(/Bose FreeSpace FS2C/i)).toBeNull();

      // Clear search button should restore full list
      const clearBtn = screen.getByTestId("btn-clear-capability-search");
      fireEvent.click(clearBtn);

      expect(screen.getByText(/Bose FreeSpace FS2C/i)).toBeDefined();
      expect(screen.getByText(/Cisco Catalyst 9300/i)).toBeDefined();
    });
  });

  describe("Unified PRODUCT Surface", () => {
    it("renders individual product surface with details, specs, and stock facets", () => {
      render(
        <MemoryRouter>
          <CatalogBrowserLens
            entityId="prod-spk-bose-fs2c"
            products={[testProductItem, testSwitchItem]}
          />
        </MemoryRouter>
      );

      // Verify Entity lens container
      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-entity-type")).toBe("PRODUCT");
      expect(lensEl.getAttribute("data-entity-id")).toBe("prod-spk-bose-fs2c");

      // Verify Product Surface Header
      expect(screen.getAllByText("Bose FreeSpace FS2C In-Ceiling Loudspeaker").length).toBeGreaterThan(0);
      expect(screen.getByText("FS2C-W-8R")).toBeDefined();
      expect(screen.getByText("Bose Professional")).toBeDefined();

      // Verify Details Facet
      const detailsSection = screen.getByTestId("product-details-section");
      expect(detailsSection).toBeDefined();
      expect(within(detailsSection).getByText(/High-performance in-ceiling loudspeaker/i)).toBeDefined();
      expect(within(detailsSection).getByText(/CE/i)).toBeDefined();
      expect(within(detailsSection).getByText(/RoHS/i)).toBeDefined();

      // Verify Specs Facet
      const specsSection = screen.getByTestId("product-specs-section");
      expect(specsSection).toBeDefined();
      expect(within(specsSection).getByText("Nominal Impedance")).toBeDefined();
      expect(within(specsSection).getByText("8Ω")).toBeDefined();
      expect(within(specsSection).getByText("Max Power Handling")).toBeDefined();
      expect(within(specsSection).getByText("200W")).toBeDefined();

      // Verify Stock Facet
      const stockSection = screen.getByTestId("product-stock-section");
      expect(stockSection).toBeDefined();
      expect(within(stockSection).getByText("48")).toBeDefined(); // onHand
      expect(within(stockSection).getByText("36")).toBeDefined(); // available
      expect(within(stockSection).getByText("12")).toBeDefined(); // reserved
      expect(within(stockSection).getByText(/Oslo Sentrallager - Bay 14-B/i)).toBeDefined();

      // Verify Back to Catalog button
      const backBtn = screen.getByTestId("btn-back-catalog");
      expect(backBtn).toBeDefined();
      fireEvent.click(backBtn);

      // Should return to grid lens
      expect(screen.getByTestId("lens-grid")).toBeDefined();
    });
  });

  describe("Integration with EntityLens", () => {
    it("mounts CatalogBrowserLens for PRODUCT entity route /e/PRODUCT/:id", () => {
      render(
        <MemoryRouter initialEntries={["/e/PRODUCT/prod-spk-bose-fs2c"]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens catalogProps={{ products: [testProductItem] }} />} />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-entity-type")).toBe("PRODUCT");
      expect(lensEl.getAttribute("data-entity-id")).toBe("prod-spk-bose-fs2c");
      expect(screen.getAllByText("Bose FreeSpace FS2C In-Ceiling Loudspeaker").length).toBeGreaterThan(0);
      expect(screen.getByTestId("product-specs-section")).toBeDefined();
    });

    it("mounts CatalogBrowserLens for /catalog or /e/PRODUCT root", () => {
      render(
        <MemoryRouter initialEntries={["/catalog"]}>
          <Routes>
            <Route path="/catalog" element={<EntityLens isCatalog catalogProps={{ products: [testProductItem, testSwitchItem] }} />} />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-grid");
      expect(lensEl).toBeDefined();
      expect(screen.getByTestId("catalog-capability-search-input")).toBeDefined();
      expect(screen.getByText("Bose FreeSpace FS2C In-Ceiling Loudspeaker")).toBeDefined();
    });
  });
});
