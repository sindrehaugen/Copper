import type { Context, Next, MiddlewareHandler } from "hono";

/**
 * Field patterns matching NCE C8 Redaction Profile.
 * Margin, Cost, Internal Notes, and Health Scores must never reach the client when customer view is engaged.
 */
const MARGIN_REGEX = /^(_?)(gross_?margin|profit_?margin|target_?margin|margin_?percent|margin_?rate|margin_?amount|margin_?target|margin)$/i;
const COST_REGEX = /^(_?)(unit_?cost|total_?cost|cost_?price|internal_?cost|purchase_?cost|estimated_?cost|labor_?cost|material_?cost|cogs|cost)$/i;
const INTERNAL_NOTES_REGEX = /^(_?)(internal_?notes?|private_?notes?|admin_?notes?|technician_?notes?|confidential_?notes?|internal_?comments?|internal_?remarks?)$/i;
const HEALTH_SCORE_REGEX = /^(_?)(health_?scores?|customer_?health|health_?ratings?|churn_?risks?|churn_?probability|account_?health|churn_?score)$/i;

/**
 * Checks whether an object key should be redacted under NCE C8 profile.
 */
export function isC8RedactedKey(key: string): boolean {
  return (
    MARGIN_REGEX.test(key) ||
    COST_REGEX.test(key) ||
    INTERNAL_NOTES_REGEX.test(key) ||
    HEALTH_SCORE_REGEX.test(key)
  );
}

/**
 * Checks whether an individual array item (e.g. note or comment) is marked internal.
 */
function isInternalItem(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    obj.is_internal === true ||
    obj.internal === true ||
    obj.isInternal === true ||
    obj.visibility === "internal" ||
    obj.private === true ||
    obj.type === "internal"
  );
}

/**
 * Deeply redacts an object, array, or primitive under the NCE C8 redaction profile.
 * Strips margin, cost, internal notes, and health scores so they never reach the client.
 */
export function redactC8Profile<T>(data: T, seen = new WeakSet<object>()): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  // Handle Date or RegExp objects
  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }

  // Cycle detection
  if (seen.has(data)) {
    return data;
  }
  seen.add(data);

  if (Array.isArray(data)) {
    const filteredArray = data
      .filter((item) => !isInternalItem(item))
      .map((item) => redactC8Profile(item, seen));
    return filteredArray as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isC8RedactedKey(key)) {
      // Omit sensitive field completely from output
      continue;
    }

    if (value && typeof value === "object") {
      result[key] = redactC8Profile(value, seen);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

export interface MaskingRequestExtractor {
  header?: (name: string) => string | null | undefined;
  query?: (name: string) => string | null | undefined;
  req?: {
    header?: (name: string) => string | null | undefined;
    query?: (name: string) => string | null | undefined;
  };
}

/**
 * Determines if customer-view masking is requested for an HTTP request.
 */
export function isMaskingRequested(c: MaskingRequestExtractor): boolean {
  const getHeader = (name: string): string | null | undefined => {
    if (c.req && typeof c.req.header === "function") {
      const val = c.req.header(name);
      if (val !== undefined && val !== null) return val;
    }
    if (typeof c.header === "function") {
      return c.header(name);
    }
    return null;
  };

  const getQuery = (name: string): string | null | undefined => {
    if (c.req && typeof c.req.query === "function") {
      const val = c.req.query(name);
      if (val !== undefined && val !== null) return val;
    }
    if (typeof c.query === "function") {
      return c.query(name);
    }
    return null;
  };

  const truthyValues = new Set(["true", "1", "yes", "on"]);

  const headerVal =
    getHeader("x-customer-view") ??
    getHeader("data-customer-view") ??
    getHeader("x-copper-masking") ??
    getHeader("x-masking");

  if (headerVal && truthyValues.has(headerVal.toLowerCase().trim())) {
    return true;
  }

  const queryVal = getQuery("customer_view") ?? getQuery("mask");
  if (queryVal && truthyValues.has(queryVal.toLowerCase().trim())) {
    return true;
  }

  return false;
}

/**
 * Hono middleware that applies NCE C8 redaction profile to JSON responses when masking is requested.
 */
export function customerViewMaskingMiddleware(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    await next();

    if (isMaskingRequested(c)) {
      const contentType = c.res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const rawBody = await c.res.clone().json();
          const redactedBody = redactC8Profile(rawBody);

          const headers = new Headers(c.res.headers);
          headers.set("x-redaction-profile", "NCE-C8");
          headers.set("x-customer-view-masked", "true");

          c.res = new Response(JSON.stringify(redactedBody), {
            status: c.res.status,
            statusText: c.res.statusText,
            headers,
          });
        } catch {
          // If response body is not valid JSON, leave as is
        }
      }
    }
  };
}
