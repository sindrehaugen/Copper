import { useState, useMemo, useEffect, useCallback } from "react";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "../BaseLens";
import type { BaseLensProps } from "../types";

export interface ProductSpec {
  name: string;
  value: string;
  category?: "electrical" | "acoustics" | "physical" | "network" | "video" | "general" | string;
  unit?: string;
}

export interface ProductStockInfo {
  onHand: number;
  available: number;
  reserved: number;
  warehouseLocation?: string;
  leadTimeDays?: number;
  minOrderQty?: number;
}

export interface ProductPriceInfo {
  currency: string;
  listPrice: number;
  costPrice?: number;
  dealerPrice?: number;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  manufacturer: string;
  category: string;
  description?: string;
  status: "active" | "in_stock" | "low_stock" | "out_of_stock" | "discontinued" | string;
  capabilities: string[];
  specs: Record<string, string | number>;
  specList?: ProductSpec[];
  stock: ProductStockInfo;
  pricing: ProductPriceInfo;
  compliance?: {
    rohs?: boolean;
    ce?: boolean;
    ul?: boolean;
    weee?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface CatalogData {
  products?: ProductItem[] | undefined;
  selectedId?: string | undefined;
  totalCount?: number | undefined;
  [key: string]: any;
}

export interface CatalogBrowserLensProps extends Partial<BaseLensProps> {
  entityId?: string | undefined;
  entityType?: string | undefined;
  products?: ProductItem[] | undefined;
  selectedProduct?: ProductItem | undefined;
  data?: CatalogData | ProductItem | null | undefined;
  viewMode?: "grid" | "details" | "capabilities" | string | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
  onSelectProduct?: ((product: ProductItem) => void) | undefined;
  onCapabilitySearch?: ((query: string) => void) | undefined;
  fetchFn?: typeof fetch | undefined;
  searchApiUrl?: string | undefined;
  initialSearchQuery?: string | undefined;
  initialCapabilityQuery?: string | undefined;
}

export const DEFAULT_CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: "prod-spk-bose-fs2c",
    sku: "FS2C-W-8R",
    name: "Bose FreeSpace FS2C In-Ceiling Loudspeaker",
    manufacturer: "Bose Professional",
    category: "Loudspeakers",
    description: "High-performance in-ceiling loudspeaker for background music and speech reproduction.",
    status: "in_stock",
    capabilities: ["8Ω", "200W", "ceiling", "in-ceiling", "passive", "70V/100V", "100 dB SPL"],
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
  },
  {
    id: "prod-spk-qsc-ad-c6t",
    sku: "AD-C6T-WH",
    name: "QSC AcousticDesign AD-C6T 6.5\" Ceiling Speaker",
    manufacturer: "QSC",
    category: "Loudspeakers",
    description: "Premium 6.5-inch two-way in-ceiling loudspeaker with DMT waveguide for consistent coverage.",
    status: "in_stock",
    capabilities: ["8Ω", "200W", "ceiling", "in-ceiling", "weather-resistant", "70V/100V", "110 dB SPL"],
    specs: {
      impedance: "8Ω",
      power: "200W",
      formFactor: "ceiling",
      frequencyResponse: "65 Hz - 20 kHz",
      maxSpl: "110 dB",
      coverageAngle: "135° conical",
    },
    specList: [
      { name: "Nominal Impedance", value: "8Ω", category: "acoustics" },
      { name: "Max Power Handling", value: "200W", category: "electrical" },
      { name: "Mounting / Enclosure", value: "In-Ceiling / Baffled", category: "physical" },
      { name: "Directivity Technology", value: "DMT (Directivity Matched Transition)", category: "acoustics" },
      { name: "Max SPL", value: "110 dB", category: "acoustics" },
    ],
    stock: {
      onHand: 24,
      available: 18,
      reserved: 6,
      warehouseLocation: "Oslo Sentrallager - Bay 14-D",
      leadTimeDays: 3,
      minOrderQty: 2,
    },
    pricing: {
      currency: "EUR",
      listPrice: 245,
      costPrice: 155,
      dealerPrice: 185,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
  {
    id: "prod-spk-jbl-control-16ct",
    sku: "C16CT-BK",
    name: "JBL Control 16C/T In-Ceiling Loudspeaker",
    manufacturer: "JBL Professional",
    category: "Loudspeakers",
    description: "Compact 6.5\" two-way coaxial in-ceiling loudspeaker with wide dispersion.",
    status: "in_stock",
    capabilities: ["8Ω", "100W", "ceiling", "in-ceiling", "passive", "70V/100V"],
    specs: {
      impedance: "8Ω",
      power: "100W",
      formFactor: "ceiling",
      frequencyResponse: "62 Hz - 20 kHz",
      maxSpl: "108 dB",
    },
    specList: [
      { name: "Nominal Impedance", value: "8Ω", category: "acoustics" },
      { name: "Max Power Handling", value: "100W", category: "electrical" },
      { name: "Mounting / Enclosure", value: "In-Ceiling Blind-Mount", category: "physical" },
    ],
    stock: {
      onHand: 60,
      available: 52,
      reserved: 8,
      warehouseLocation: "Bergen Hub - Shelf A2",
      leadTimeDays: 1,
      minOrderQty: 2,
    },
    pricing: {
      currency: "EUR",
      listPrice: 165,
      costPrice: 105,
      dealerPrice: 125,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
  {
    id: "prod-sw-cisco-9300-24ux",
    sku: "C9300-24UX-A",
    name: "Cisco Catalyst 9300 24-Port UPOE/PoE++ Switch",
    manufacturer: "Cisco Systems",
    category: "Network Switches",
    description: "Enterprise stackable 24-port multigigabit switch with 90W 802.3bt PoE++ per port.",
    status: "in_stock",
    capabilities: ["PoE++", "24p", "24-port", "802.3bt", "mGig", "Layer 3", "StackWise-480"],
    specs: {
      ports: "24p",
      poe: "PoE++",
      poeBudget: "830W",
      switchingCapacity: "128 Gbps",
      rackUnits: "1U",
      stackable: "Yes",
    },
    specList: [
      { name: "Network Ports", value: "24p Multi-Gigabit (100M/1G/2.5G/5G/10G)", category: "network" },
      { name: "PoE Capability", value: "PoE++ (802.3bt Type 4, up to 90W)", category: "electrical" },
      { name: "Total PoE Budget", value: "830W", category: "electrical" },
      { name: "Form Factor", value: "1U Rackmount", category: "physical" },
      { name: "Switching Capacity", value: "128 Gbps", category: "network" },
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
  },
  {
    id: "prod-sw-netgear-m4250-26g4f",
    sku: "GSM4230P",
    name: "NETGEAR AV Line M4250-26G4F-PoE++ Managed Switch",
    manufacturer: "NETGEAR",
    category: "Network Switches",
    description: "Pro AV specialized managed switch with 24 PoE++ Ultra90 ports and pre-configured AV profiles.",
    status: "in_stock",
    capabilities: ["PoE++", "24p", "24-port", "802.3bt", "Dante Ready", "AV over IP", "NDI", "1440W"],
    specs: {
      ports: "24p",
      poe: "PoE++",
      poeBudget: "1440W",
      rackUnits: "1U",
      avProfiles: "Dante, Q-SYS, NDI5, AES67",
    },
    specList: [
      { name: "Port Configuration", value: "24p Gigabit + 2p 10G SFP+ + 4p SFP", category: "network" },
      { name: "PoE Support", value: "PoE++ (802.3bt Ultra90, up to 90W/port)", category: "electrical" },
      { name: "Total PoE Budget", value: "1440W with secondary PSU", category: "electrical" },
      { name: "Form Factor", value: "1U Rackmount / Reversible Mounting", category: "physical" },
    ],
    stock: {
      onHand: 20,
      available: 16,
      reserved: 4,
      warehouseLocation: "Oslo Sentrallager - Rack C-02",
      leadTimeDays: 2,
      minOrderQty: 1,
    },
    pricing: {
      currency: "EUR",
      listPrice: 2890,
      costPrice: 1950,
      dealerPrice: 2320,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
  {
    id: "prod-mic-shure-mxa920",
    sku: "MXA920W-S",
    name: "Shure Microflex Advance MXA920 Ceiling Array Microphone",
    manufacturer: "Shure",
    category: "Microphones",
    description: "Next-generation ceiling array microphone with Automatic Coverage technology and onboard IntelliMix DSP.",
    status: "in_stock",
    capabilities: ["Dante", "AES67", "ceiling", "array microphone", "PoE", "Autofocus", "8ch"],
    specs: {
      formFactor: "ceiling",
      audioProtocol: "Dante / AES67",
      channels: "8ch",
      poe: "PoE (802.3af Class 0)",
      coverageArea: "30 x 30 ft (9 x 9 m)",
    },
    specList: [
      { name: "Acoustic Coverage", value: "Up to 8 discrete steerable lobes", category: "acoustics" },
      { name: "Audio Protocols", value: "Dante / AES67 Digital Audio", category: "network" },
      { name: "Channels", value: "8 individual + 1 automix output (8ch)", category: "acoustics" },
      { name: "Mounting", value: "Ceiling Grid Flush, VESA, or Pole", category: "physical" },
    ],
    stock: {
      onHand: 32,
      available: 25,
      reserved: 7,
      warehouseLocation: "Oslo Sentrallager - Bay 08-A",
      leadTimeDays: 2,
      minOrderQty: 1,
    },
    pricing: {
      currency: "EUR",
      listPrice: 3800,
      costPrice: 2450,
      dealerPrice: 2980,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
  {
    id: "prod-dsp-qsc-core-nano",
    sku: "CORE-NANO",
    name: "Q-SYS Core Nano Audio & Control Processor",
    manufacturer: "QSC",
    category: "Processors",
    description: "Compact network I/O processor with 64x64 networked audio channels and full control engine.",
    status: "in_stock",
    capabilities: ["Dante", "AES67", "Q-SYS", "DSP", "VoIP", "AEC", "64ch"],
    specs: {
      audioProtocol: "Q-LAN / Dante",
      channels: "64ch",
      rackUnits: "Half-RU",
      usbBridging: "Yes (Audio + Video)",
    },
    specList: [
      { name: "Network Channel Capacity", value: "64x64 Q-LAN / Dante / AES67", category: "network" },
      { name: "Processing Architecture", value: "Intel multicore CPU", category: "electrical" },
      { name: "Form Factor", value: "Half-RU Rackmount", category: "physical" },
    ],
    stock: {
      onHand: 18,
      available: 14,
      reserved: 4,
      warehouseLocation: "Oslo Sentrallager - Rack D-01",
      leadTimeDays: 3,
      minOrderQty: 1,
    },
    pricing: {
      currency: "EUR",
      listPrice: 2490,
      costPrice: 1650,
      dealerPrice: 1980,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
  {
    id: "prod-disp-samsung-qm65b",
    sku: "LH65QMCEBGCXEN",
    name: "Samsung QM65B 65\" 4K UHD Commercial Display",
    manufacturer: "Samsung",
    category: "Displays",
    description: "Slim 4K UHD commercial display engineered for 24/7 continuous operation with non-glare panel.",
    status: "in_stock",
    capabilities: ["4K60", "commercial", "500 nits", "Tizen", "HDMI 2.0", "24/7"],
    specs: {
      resolution: "4K60 (3840x2160)",
      brightness: "500 nits",
      operation: "24/7",
      panelType: "VA Non-Glare",
      diagonal: "65 inch",
    },
    specList: [
      { name: "Native Resolution", value: "4K UHD (3840 x 2160) @ 60Hz (4K60)", category: "video" },
      { name: "Brightness", value: "500 nits (cd/m2)", category: "video" },
      { name: "Duty Cycle", value: "24/7 Commercial Rating", category: "general" },
      { name: "Video Inputs", value: "3x HDMI 2.0, 1x DisplayPort 1.2", category: "video" },
    ],
    stock: {
      onHand: 15,
      available: 11,
      reserved: 4,
      warehouseLocation: "Bergen Hub - Oversized Pallet 3",
      leadTimeDays: 4,
      minOrderQty: 1,
    },
    pricing: {
      currency: "EUR",
      listPrice: 1540,
      costPrice: 1080,
      dealerPrice: 1250,
    },
    compliance: {
      ce: true,
      rohs: true,
      ul: true,
    },
  },
];

/**
 * Capability Matcher
 * Parses queries like "8Ω 200W ceiling", "PoE++ 24p", "Dante 8ch"
 * and verifies against product capabilities, specs, and attributes.
 */
export function matchProductCapabilityQuery(product: ProductItem, query: string): {
  matches: boolean;
  matchedTokens: string[];
} {
  if (!query || !query.trim()) {
    return { matches: true, matchedTokens: [] };
  }

  // Tokenize query while preserving terms with spaces or special chars
  const rawTokens = query.trim().split(/\s+/);
  const matchedTokens: string[] = [];

  // Build searchable corpus for this product
  const capabilitiesList = product.capabilities.map((c) => c.toLowerCase());
  const specsKeyValues = Object.entries(product.specs).map(
    ([k, v]) => `${k} ${v}`.toLowerCase()
  );
  const specListValues = (product.specList || []).map(
    (s) => `${s.name} ${s.value}`.toLowerCase()
  );

  const productCorpus = [
    product.name.toLowerCase(),
    product.sku.toLowerCase(),
    product.manufacturer.toLowerCase(),
    product.category.toLowerCase(),
    product.description?.toLowerCase() || "",
    ...capabilitiesList,
    ...specsKeyValues,
    ...specListValues,
  ].join(" ");

  // Normalization helper for AV/IT engineering tokens
  const normalizeTokenVariants = (token: string): string[] => {
    const t = token.toLowerCase();
    const variants = [t];

    // Impedance: 8Ω, 8ohm, 8o, 8-ohm
    const ohmMatch = t.match(/^(\d+)(?:[Ωo]|ohm|ohms|-ohm)$/);
    if (ohmMatch) {
      const num = ohmMatch[1];
      variants.push(`${num}Ω`, `${num} ohm`, `${num}ohm`, `${num}o`);
    }

    // Power: 200w, 200watt, 200watts
    const wattMatch = t.match(/^(\d+)(?:w|watt|watts|-watt)$/);
    if (wattMatch) {
      const num = wattMatch[1];
      variants.push(`${num}w`, `${num} watt`, `${num}w `);
    }

    // Ports: 24p, 24-port, 24port, 24ports
    const portMatch = t.match(/^(\d+)(?:p|port|ports|-port)$/);
    if (portMatch) {
      const num = portMatch[1];
      variants.push(`${num}p`, `${num} port`, `${num}-port`, `${num}port`);
    }

    // Channels: 8ch, 8-channel
    const chMatch = t.match(/^(\d+)(?:ch|channel|channels)$/);
    if (chMatch) {
      const num = chMatch[1];
      variants.push(`${num}ch`, `${num} channel`, `${num}-channel`);
    }

    // PoE: poe++, poe+, 802.3bt
    if (t === "poe++" || t === "802.3bt" || t === "upoe") {
      variants.push("poe++", "802.3bt", "upoe", "ultra90");
    } else if (t === "poe+" || t === "802.3at") {
      variants.push("poe+", "802.3at");
    }

    // Ceiling / in-ceiling
    if (t === "ceiling" || t === "in-ceiling" || t === "inceiling") {
      variants.push("ceiling", "in-ceiling", "inceiling");
    }

    return variants;
  };

  // Every token in the user's capability query must find a match
  for (const token of rawTokens) {
    const variants = normalizeTokenVariants(token);
    const tokenMatched = variants.some((v) => productCorpus.includes(v));
    if (!tokenMatched) {
      return { matches: false, matchedTokens: [] };
    }
    matchedTokens.push(token);
  }

  return { matches: true, matchedTokens };
}

function formatPriceNumber(val: number): string {
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export const CatalogBrowserLens: FC<CatalogBrowserLensProps> = (props) => {
  const { t } = useTranslation();

  const rawEntityId = props.entityId || "";
  const isModuleRoot =
    !rawEntityId ||
    rawEntityId.toLowerCase() === "root" ||
    rawEntityId.toLowerCase() === "grid" ||
    rawEntityId.toLowerCase() === "all" ||
    rawEntityId.toLowerCase() === "catalog" ||
    rawEntityId.toLowerCase() === "products";

  const allProducts: ProductItem[] = useMemo(() => {
    if (props.products && props.products.length > 0) {
      return props.products;
    }
    if (props.data) {
      if (Array.isArray((props.data as CatalogData).products)) {
        return (props.data as CatalogData).products!;
      }
      if ((props.data as ProductItem).id) {
        return [props.data as ProductItem];
      }
    }
    return DEFAULT_CATALOG_PRODUCTS;
  }, [props.products, props.data]);

  const [selectedId, setSelectedId] = useState<string>(
    isModuleRoot ? "" : rawEntityId
  );

  const [textSearchQuery, setTextSearchQuery] = useState(
    props.initialSearchQuery || ""
  );
  const [capabilitySearchQuery, setCapabilitySearchQuery] = useState(
    props.initialCapabilityQuery || ""
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const effectiveId = selectedId || (!isModuleRoot ? rawEntityId : "");

  const activeProduct = useMemo(() => {
    if (!effectiveId) return null;
    const found = allProducts.find((p) => p.id === effectiveId);
    if (found) return found;
    return allProducts[0] || null;
  }, [effectiveId, allProducts]);

  const handleSelectProduct = (product: ProductItem) => {
    if (props.onSelectProduct) {
      props.onSelectProduct(product);
    }
    if (props.onNavigate) {
      props.onNavigate(`/e/PRODUCT/${product.id}`, product);
    }
    setSelectedId(product.id);
  };

  const handleBackToGrid = () => {
    setSelectedId("");
    if (props.onNavigate) {
      props.onNavigate("/e/PRODUCT");
    }
  };

  const handleCapabilitySearchChange = (val: string) => {
    setCapabilitySearchQuery(val);
    if (props.onCapabilitySearch) {
      props.onCapabilitySearch(val);
    }
  };

  const handleApplyPreset = (presetQuery: string) => {
    setCapabilitySearchQuery(presetQuery);
    if (props.onCapabilitySearch) {
      props.onCapabilitySearch(presetQuery);
    }
  };

  const handleClearCapabilitySearch = () => {
    setCapabilitySearchQuery("");
    if (props.onCapabilitySearch) {
      props.onCapabilitySearch("");
    }
  };

  // Filter products by category, status, text search, and capability search
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }

      // Capability Search filter
      if (capabilitySearchQuery.trim()) {
        const capResult = matchProductCapabilityQuery(p, capabilitySearchQuery);
        if (!capResult.matches) {
          return false;
        }
      }

      // Text search query filter
      if (textSearchQuery.trim()) {
        const q = textSearchQuery.toLowerCase();
        const matchText =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!matchText) {
          return false;
        }
      }

      return true;
    });
  }, [
    allProducts,
    selectedCategory,
    selectedStatus,
    capabilitySearchQuery,
    textSearchQuery,
  ]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [allProducts]);

  const inStockCount = useMemo(() => {
    return allProducts.filter(
      (p) => p.status === "in_stock" || p.stock.available > 0
    ).length;
  }, [allProducts]);

  // If viewing an individual product detail surface
  if (activeProduct) {
    return (
      <BaseLens
        title={props.title || activeProduct.name}
        subtitle={
          props.subtitle ||
          `${activeProduct.sku} · ${activeProduct.manufacturer} · ${activeProduct.category}`
        }
        lensKind="entity"
        data-entity-type="PRODUCT"
        data-entity-id={activeProduct.id}
        dataTestId="lens-entity"
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="m3-button m3-button-outlined"
              onClick={handleBackToGrid}
              data-testid="btn-back-catalog"
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid var(--copper-primary, #b87333)",
                background: "transparent",
                color: "var(--copper-primary, #b87333)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {t("catalog.backToCatalog", "← Back to Catalog")}
            </button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "16px 0",
          }}
        >
          {/* Header Card with Core Overview and Price */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                    color: "var(--md-sys-color-on-surface, #1b1b1b)",
                  }}
                >
                  {activeProduct.sku}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(58, 110, 106, 0.12)",
                    color: "var(--copper-secondary, #3a6e6a)",
                    fontWeight: 600,
                  }}
                >
                  {activeProduct.category}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      activeProduct.status === "in_stock"
                        ? "#e8f5e9"
                        : "#fff3e0",
                    color:
                      activeProduct.status === "in_stock"
                        ? "#2e7d32"
                        : "#e65100",
                    fontWeight: 600,
                  }}
                >
                  {activeProduct.status.toUpperCase()}
                </span>
              </div>
              <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700 }}>
                {activeProduct.name}
              </h2>
              <div style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontSize: "14px" }}>
                <span>{t("catalog.manufacturer", "Manufacturer")}: </span>
                <strong>{activeProduct.manufacturer}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                {t("catalog.listPriceLabel", "List Price")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--copper-primary, #b87333)",
                }}
              >
                {formatPriceNumber(activeProduct.pricing.listPrice)} {activeProduct.pricing.currency}
              </div>
              {activeProduct.pricing.dealerPrice && (
                <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginTop: "2px" }}>
                  <span>{t("catalog.dealerPrice", "Dealer")}: </span>
                  <span style={{ fontWeight: 600 }}>{formatPriceNumber(activeProduct.pricing.dealerPrice)} {activeProduct.pricing.currency}</span>
                </div>
              )}
            </div>
          </div>

          {/* Facets Grid: Details, Specs, Stock */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Facet 1: Product Details */}
            <div
              data-testid="product-details-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                }}
              >
                {t("catalog.productDetails", "Product Details & Overview")}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", display: "block", marginBottom: "4px", fontSize: "12px" }}>
                    {t("catalog.description", "Description")}
                  </span>
                  <p style={{ margin: 0, lineHeight: "1.5" }}>
                    {activeProduct.description || t("catalog.noDescription", "Standard enterprise product item.")}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.skuCode", "SKU / Part Number")}:
                  </span>
                  <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{activeProduct.sku}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.manufacturerLabel", "Brand / Vendor")}:
                  </span>
                  <span style={{ fontWeight: 600 }}>{activeProduct.manufacturer}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.lifecycle", "Lifecycle Posture")}:
                  </span>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{activeProduct.status.replace("_", " ")}</span>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", display: "block", marginBottom: "6px", fontSize: "12px" }}>
                    {t("catalog.compliance", "Regulatory Compliance & Certifications")}
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {activeProduct.compliance?.ce && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#f0f0f0",
                          border: "1px solid #d0d0d0",
                        }}
                      >
                        CE
                      </span>
                    )}
                    {activeProduct.compliance?.rohs && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          border: "1px solid #c8e6c9",
                        }}
                      >
                        RoHS
                      </span>
                    )}
                    {activeProduct.compliance?.ul && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#e3f2fd",
                          color: "#1565c0",
                          border: "1px solid #bbdefb",
                        }}
                      >
                        UL Listed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Facet 2: Technical Specifications & Capabilities */}
            <div
              data-testid="product-specs-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                }}
              >
                {t("catalog.technicalSpecs", "Technical Specifications")}
              </h3>

              {/* Capabilities Badges */}
              <div style={{ marginBottom: "14px" }}>
                <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  {t("catalog.indexedCapabilities", "Indexed Capabilities")}
                </span>
                <div
                  data-testid="product-capabilities-list"
                  style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                >
                  {activeProduct.capabilities.map((cap) => (
                    <span
                      key={cap}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(184, 115, 51, 0.12)",
                        color: "var(--copper-primary, #b87333)",
                        border: "1px solid rgba(184, 115, 51, 0.25)",
                      }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Specs Table / List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                {(activeProduct.specList || Object.entries(activeProduct.specs).map(([name, value]) => ({ name, value: String(value) }))).map((spec) => (
                  <div
                    key={spec.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: "1px dashed var(--md-sys-color-outline-variant, #f0f0f0)",
                    }}
                  >
                    <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                      {spec.name}:
                    </span>
                    <span style={{ fontWeight: 600 }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facet 3: Inventory & Warehouse Stock */}
            <div
              data-testid="product-stock-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                }}
              >
                {t("catalog.inventoryStock", "Inventory & Warehouse Stock")}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    padding: "12px",
                    backgroundColor: "var(--md-sys-color-surface-variant, #f8f8f8)",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>On Hand</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{activeProduct.stock.onHand}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>Available</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#2e7d32", fontVariantNumeric: "tabular-nums" }}>
                      {activeProduct.stock.available}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>Reserved</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#e65100", fontVariantNumeric: "tabular-nums" }}>
                      {activeProduct.stock.reserved}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.warehouseLocation", "Warehouse Location")}:
                  </span>
                  <span style={{ fontWeight: 600 }}>{activeProduct.stock.warehouseLocation || "Main Warehouse"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.leadTime", "Restock Lead Time")}:
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {activeProduct.stock.leadTimeDays ? `${activeProduct.stock.leadTimeDays} days` : "Immediate"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("catalog.moq", "Minimum Order Qty")}:
                  </span>
                  <span style={{ fontWeight: 600 }}>{activeProduct.stock.minOrderQty || 1} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseLens>
    );
  }

  // Otherwise, render Grid Lens over Product Catalog
  return (
    <BaseLens
      title={props.title || t("catalog.browserTitle", "Product Catalog Browser")}
      subtitle={
        props.subtitle ||
        t("catalog.browserSubtitle", "Native M2 Product Catalog · Technical Specs & Inventory")
      }
      lensKind="grid"
      dataTestId="lens-grid"
      data-entity-type="PRODUCT"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "16px 0",
        }}
      >
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            data-testid="kpi-total-products"
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("catalog.totalProducts", "Total Catalog Products")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {allProducts.length}
            </div>
          </div>

          <div
            data-testid="kpi-in-stock"
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("catalog.inStockAvailable", "In-Stock Availability")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#2e7d32", fontVariantNumeric: "tabular-nums" }}>
              {inStockCount} {t("catalog.itemsAvailable", "items")}
            </div>
          </div>

          <div
            data-testid="kpi-categories"
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("catalog.categoriesCount", "Active Categories")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {categories.length}
            </div>
          </div>
        </div>

        {/* Search & Capability Control Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "18px",
            backgroundColor: "var(--md-sys-color-surface, #ffffff)",
            borderRadius: "8px",
            border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Standard Text Search */}
            <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="catalog-text-search-input"
                style={{ fontSize: "12px", fontWeight: 600, color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}
              >
                {t("catalog.keywordSearch", "Keyword Search")}
              </label>
              <input
                id="catalog-text-search-input"
                data-testid="catalog-text-search-input"
                type="text"
                value={textSearchQuery}
                onChange={(e) => setTextSearchQuery(e.target.value)}
                placeholder={t("catalog.searchPlaceholder", "Search by model, SKU, or manufacturer...")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--md-sys-color-outline-variant, #d0d0d0)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Capability Search Bar (e.g. "8Ω 200W ceiling", "PoE++ 24p") */}
            <div style={{ flex: "2 1 360px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="catalog-capability-search-input"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--copper-primary, #b87333)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{t("catalog.capabilitySearch", "⚡ Capability Search (Specs & Standards)")}</span>
                {capabilitySearchQuery && (
                  <button
                    type="button"
                    data-testid="btn-clear-capability-search"
                    onClick={handleClearCapabilitySearch}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--copper-error, #ba1a1a)",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {t("common.clear", "Clear")}
                  </button>
                )}
              </label>
              <input
                id="catalog-capability-search-input"
                data-testid="catalog-capability-search-input"
                type="text"
                value={capabilitySearchQuery}
                onChange={(e) => handleCapabilitySearchChange(e.target.value)}
                placeholder={t("catalog.capabilityPlaceholder", 'Enter capabilities, e.g. "8Ω 200W ceiling", "PoE++ 24p"...')}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--copper-primary, #b87333)",
                  backgroundColor: "rgba(184, 115, 51, 0.03)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Quick Preset Chips for Capabilities */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontWeight: 600 }}>
              {t("catalog.examples", "Example Capabilities")}:
            </span>
            <button
              type="button"
              data-testid="capability-chip-8o-200w-ceiling"
              onClick={() => handleApplyPreset("8Ω 200W ceiling")}
              style={{
                cursor: "pointer",
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(184, 115, 51, 0.3)",
                backgroundColor: capabilitySearchQuery.includes("8Ω 200W ceiling") ? "var(--copper-primary, #b87333)" : "#f8f8f8",
                color: capabilitySearchQuery.includes("8Ω 200W ceiling") ? "#ffffff" : "var(--copper-primary, #b87333)",
              }}
            >
              8Ω 200W ceiling
            </button>
            <button
              type="button"
              data-testid="capability-chip-poe-24p"
              onClick={() => handleApplyPreset("PoE++ 24p")}
              style={{
                cursor: "pointer",
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(184, 115, 51, 0.3)",
                backgroundColor: capabilitySearchQuery.includes("PoE++ 24p") ? "var(--copper-primary, #b87333)" : "#f8f8f8",
                color: capabilitySearchQuery.includes("PoE++ 24p") ? "#ffffff" : "var(--copper-primary, #b87333)",
              }}
            >
              PoE++ 24p
            </button>
            <button
              type="button"
              data-testid="capability-chip-dante-8ch"
              onClick={() => handleApplyPreset("Dante 8ch")}
              style={{
                cursor: "pointer",
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(184, 115, 51, 0.3)",
                backgroundColor: capabilitySearchQuery.includes("Dante 8ch") ? "var(--copper-primary, #b87333)" : "#f8f8f8",
                color: capabilitySearchQuery.includes("Dante 8ch") ? "#ffffff" : "var(--copper-primary, #b87333)",
              }}
            >
              Dante 8ch
            </button>
            <button
              type="button"
              data-testid="capability-chip-4k60-comm"
              onClick={() => handleApplyPreset("4K60 commercial")}
              style={{
                cursor: "pointer",
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(184, 115, 51, 0.3)",
                backgroundColor: capabilitySearchQuery.includes("4K60 commercial") ? "var(--copper-primary, #b87333)" : "#f8f8f8",
                color: capabilitySearchQuery.includes("4K60 commercial") ? "#ffffff" : "var(--copper-primary, #b87333)",
              }}
            >
              4K60 commercial
            </button>
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", borderTop: "1px solid var(--md-sys-color-outline-variant, #f0f0f0)", paddingTop: "10px" }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              style={{
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: selectedCategory === "all" ? 600 : 400,
                backgroundColor: selectedCategory === "all" ? "var(--copper-secondary, #3a6e6a)" : "transparent",
                color: selectedCategory === "all" ? "#ffffff" : "var(--md-sys-color-on-surface, #1b1b1b)",
                border: "1px solid var(--md-sys-color-outline-variant, #d0d0d0)",
              }}
            >
              {t("catalog.allCategories", "All Categories")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  backgroundColor: selectedCategory === cat ? "var(--copper-secondary, #3a6e6a)" : "transparent",
                  color: selectedCategory === cat ? "#ffffff" : "var(--md-sys-color-on-surface, #1b1b1b)",
                  border: "1px solid var(--md-sys-color-outline-variant, #d0d0d0)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* The Grid Table */}
        <div
          data-testid="catalog-products-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
              {filteredProducts.length} {t("catalog.recordsCount", "products found")}
            </span>
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              borderRadius: "8px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
            }}
          >
            <table
              role="grid"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                    borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  }}
                >
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.skuHeader", "SKU")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.productHeader", "Product & Brand")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.categoryHeader", "Category")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.capabilitiesHeader", "Capabilities & Specs")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.stockHeader", "Stock")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("catalog.priceHeader", "List Price")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("catalog.statusHeader", "Status")}</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("catalog.actionsHeader", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "36px 14px",
                        textAlign: "center",
                        color: "var(--md-sys-color-on-surface-variant, #5e5e5e)",
                      }}
                    >
                      {t("catalog.noProductsMatch", "No products match the selected capability and keyword filters.")}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, idx) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom:
                          idx < filteredProducts.length - 1
                            ? "1px solid var(--md-sys-color-outline-variant, #e0e0e0)"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 600 }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                          {p.manufacturer}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(58, 110, 106, 0.12)",
                            color: "var(--copper-secondary, #3a6e6a)",
                            fontWeight: 600,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {p.capabilities.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(184, 115, 51, 0.1)",
                                color: "var(--copper-primary, #b87333)",
                              }}
                            >
                              {c}
                            </span>
                          ))}
                          {p.capabilities.length > 4 && (
                            <span style={{ fontSize: "10px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                              +{p.capabilities.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                          {p.stock.available} {t("catalog.avail", "avail")}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                          {p.stock.warehouseLocation ? p.stock.warehouseLocation.split("-")[0] : "Central"}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "right",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatPriceNumber(p.pricing.listPrice)} {p.pricing.currency}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              p.status === "in_stock"
                                ? "#e8f5e9"
                                : "#fff3e0",
                            color:
                              p.status === "in_stock"
                                ? "#2e7d32"
                                : "#e65100",
                          }}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          data-testid={`view-product-${p.id}`}
                          onClick={() => handleSelectProduct(p)}
                          style={{
                            cursor: "pointer",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            border: "1px solid var(--copper-primary, #b87333)",
                            backgroundColor: "transparent",
                            color: "var(--copper-primary, #b87333)",
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        >
                          {t("catalog.viewDetails", "Details →")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLens>
  );
};
